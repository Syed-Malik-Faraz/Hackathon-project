import os
import json
import logging
from typing import List, Dict, Optional
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel, Field, validator
import httpx
import asyncio
 
# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("timetable-api")
 
# Environment config
# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_KEY = "AIzaSyBU6nhtQtivjkFccJGZqRX7ljI4bfshN7w"
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY is not set. Set environment variable GEMINI_API_KEY before running.")
 
# FastAPI app
app = FastAPI(title="Smart Timetable Scheduler API",
              description="Send faculties, classes, and constraints. Gemini returns a JSON timetable.",
              version="1.0.0")
 
# ---------- Pydantic models for request/response ----------
 
from fastapi.middleware.cors import CORSMiddleware
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
 
class Faculty(BaseModel):
    name: str = Field(..., description="Faculty name")
    subjects: List[str] = Field(..., description="Subjects this faculty can teach")
 
class ClassReq(BaseModel):
    name: str = Field(..., description="Class name (e.g. Grade10A)")
    subjects: List[str] = Field(..., description="Subjects required by this class")
 
class Constraints(BaseModel):
    periods_per_day: int = Field(6, ge=1, le=12, description="Number of periods per day")
    days: List[str] = Field(default_factory=lambda: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"])
    sessions_per_subject_per_week: Optional[int] = Field(5, ge=0, description="Default sessions per subject per week")
    avoid_double_periods_for: Optional[List[str]] = Field(None, description="List of subjects to avoid double periods for")
    # add more constraints if you want
 
    @validator("days")
    def days_nonempty(cls, v):
        if not v:
            raise ValueError("days must be a non-empty list")
        return v
 
class TimetableRequest(BaseModel):
    faculties: List[Faculty]
    classes: List[ClassReq]
    constraints: Optional[Constraints] = Field(default_factory=Constraints)
 
# ---------- Helper functions ----------
 
def build_gemini_prompt(payload: TimetableRequest) -> str:
    """
    Builds a clear deterministic prompt for Gemini instructing to return ONLY JSON.
    """
    # Make sure we pass an explicit json schema and strict instructions
    prompt = f"""
You are an expert timetable scheduling assistant. Produce ONLY valid JSON that conforms exactly to the Output JSON Schema described below.
Do NOT include extra commentary, explanation, or markdown. If you cannot produce a schedule, return an "error" object with details.
 
Input data:
Faculties: {json.dumps([f.dict() for f in payload.faculties], ensure_ascii=False)}
Classes: {json.dumps([c.dict() for c in payload.classes], ensure_ascii=False)}
Constraints: {json.dumps(payload.constraints.dict(), ensure_ascii=False)}
 
Output JSON Schema:
{{
  "timetable": {{
    "<Day>": {{
      "Period <n>": {{ "class": "<class name>", "subject": "<subject>", "teacher": "<faculty name>" }},
      ...
    }},
    ...
  }},
  "meta": {{
    "generated_by": "gemini-2.0-flash",
    "notes": "<optional short notes>"
  }}
}}
 
Rules:
1. Use the 'days' list from constraints as the days in the timetable (in that order).
2. Each day must have exactly {payload.constraints.periods_per_day} periods labeled "Period 1" .. "Period {payload.constraints.periods_per_day}".
3. Do NOT assign a teacher to two classes at the same Period (no conflicts).
4. Each subject listed for a class should appear approximately {payload.constraints.sessions_per_subject_per_week} times per week (try to match as possible).
5. If you cannot satisfy all constraints, still output the best timetable and include a short 'notes' string describing compromises.
6. Use teacher names exactly as provided.
7. Output must be valid JSON (top-level object). No surrounding markdown or backticks.
 
Generate the timetable now.
"""
    return prompt.strip()
 
async def call_gemini(prompt: str, temperature: float = 0.2, max_retries: int = 3, timeout_seconds: int = 30) -> Dict:
    """
    Calls Gemini API and returns parsed JSON (if possible). Retries a few times on transient errors.
    """
    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY or "",
    }
 
    payload = {
        "contents": [
            {"parts": [{"text": prompt}]}
        ],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": temperature
        }
    }
 
    attempt = 0
    while attempt < max_retries:
        attempt += 1
        try:
            async with httpx.AsyncClient(timeout=timeout_seconds) as client:
                resp = await client.post(GEMINI_URL, headers=headers, json=payload)
                text = resp.text
                if resp.status_code != 200:
                    logger.error("Gemini returned %s: %s", resp.status_code, text)
                    # If 4xx, don't retry (likely bad request)
                    if 400 <= resp.status_code < 500:
                        raise HTTPException(status_code=502, detail=f"Gemini API error {resp.status_code}: {text}")
                    # else retry
                    await asyncio.sleep(1.0 * attempt)
                    continue
 
                # The API may return a structured envelope. Try parse as JSON.
                try:
                    parsed = resp.json()  # top-level JSON envelope
                except Exception:
                    # If top-level parsing fails, assume the body is raw text (maybe the model output)
                    parsed = None
 
                # If parsed envelope exists, attempt to extract model output text
                if parsed:
                    # The generativelanguage API may include the generated text under 'candidates' or 'output' fields.
                    # Try to find the text payload robustly.
                    # Note: adapt this if Google changes response envelope.
                    generated_text = None
                    # Common locations:
                    # - parsed['candidates'][0]['content'][0]['text']
                    # - parsed['outputs'][0]['content'][0]['text']
                    # - parsed['items']...
                    def deep_get_text(obj):
                        if isinstance(obj, dict):
                            for k, v in obj.items():
                                if k == "text" and isinstance(v, str):
                                    return v
                                result = deep_get_text(v)
                                if result:
                                    return result
                        elif isinstance(obj, list):
                            for it in obj:
                                result = deep_get_text(it)
                                if result:
                                    return result
                        return None
 
                    generated_text = deep_get_text(parsed)
                    if generated_text:
                        # Try to parse the generated_text as JSON
                        try:
                            return json.loads(generated_text)
                        except Exception:
                            # If the generated text contains JSON inside other text, attempt to extract {...}
                            start = generated_text.find("{")
                            end = generated_text.rfind("}")
                            if start != -1 and end != -1 and end > start:
                                snippet = generated_text[start:end+1]
                                try:
                                    return json.loads(snippet)
                                except Exception:
                                    pass
                            # fallback: if parsed itself looks like our desired json (top-level)
                            # e.g., parsed may directly be the json we need
                            if isinstance(parsed, dict) and ("timetable" in parsed or "meta" in parsed):
                                return parsed
                            # If nothing worked, raise to try retry
                            raise ValueError("Could not parse JSON timetable from Gemini output.")
                    else:
                        # No generated text found inside envelope, maybe the top-level parsed is our timetable already
                        if isinstance(parsed, dict) and ("timetable" in parsed or "meta" in parsed):
                            return parsed
                        raise ValueError("Could not find generated text in Gemini response.")
                else:
                    # resp.text exists and top-level JSON parse failed. Try parse resp.text
                    try:
                        return json.loads(text)
                    except Exception:
                        # attempt to extract JSON block from text
                        start = text.find("{")
                        end = text.rfind("}")
                        if start != -1 and end != -1 and end > start:
                            snippet = text[start:end+1]
                            try:
                                return json.loads(snippet)
                            except Exception:
                                pass
                        raise ValueError("Gemini returned non-JSON output and we couldn't extract JSON.")
 
        except (httpx.RequestError, httpx.TimeoutException) as e:
            logger.warning("Network error when calling Gemini (attempt %s/%s): %s", attempt, max_retries, str(e))
            if attempt >= max_retries:
                raise HTTPException(status_code=502, detail=f"Error contacting Gemini API: {e}")
            await asyncio.sleep(0.5 * attempt)
        except HTTPException:
            raise
        except Exception as e:
            logger.exception("Parsing/other error on attempt %s/%s: %s", attempt, max_retries, str(e))
            # If parsing failed, don't always retry more than once
            if attempt >= max_retries:
                raise HTTPException(status_code=502, detail=f"Failed to parse Gemini response: {e}")
            await asyncio.sleep(0.7 * attempt)
 
    raise HTTPException(status_code=502, detail="Failed to get a valid response from Gemini after retries.")
 
# ---------- API endpoints ----------
 
@app.post("/generate_timetable", summary="Generate timetable", description="Send faculties/classes/constraints. Returns timetable JSON.")
async def generate_timetable(req: TimetableRequest):
    # Quick validation: basic overlap sanity checks
    if not req.faculties:
        raise HTTPException(status_code=400, detail="No faculties provided.")
    if not req.classes:
        raise HTTPException(status_code=400, detail="No classes provided.")
    # Build prompt
    prompt = build_gemini_prompt(req)
 
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Server missing GEMINI_API_KEY environment variable.")
 
    # Call Gemini
    result = await call_gemini(prompt)
 
    # Basic sanity check of returned JSON
    if not isinstance(result, dict) or "timetable" not in result:
        raise HTTPException(status_code=502, detail="Gemini did not return valid timetable JSON.")
 
    # Optionally: additional server-side validation could be added here (e.g., confirm no teacher conflicts)
    # We'll do a lightweight conflict check:
    try:
        check_teacher_conflicts(result, req.constraints.periods_per_day, req.constraints.days)
    except ValueError as e:
        # If conflict detected, include note but still return timetable
        logger.warning("Conflict detected in generated timetable: %s", e)
        if "meta" not in result:
            result["meta"] = {}
        result["meta"]["server_validation_notes"] = str(e)
 
    return result
 
def check_teacher_conflicts(timetable_json: Dict, periods_per_day: int, days: List[str]):
    """
    Light check: ensure no teacher appears in two classes at the same day and period.
    Raises ValueError on conflict with details.
    """
    tt = timetable_json.get("timetable", {})
    conflicts = []
    for day in days:
        day_schedule = tt.get(day)
        if not isinstance(day_schedule, dict):
            conflicts.append(f"Missing or invalid schedule for day: {day}")
            continue
        for p in range(1, periods_per_day + 1):
            period_key = f"Period {p}"
            entry = day_schedule.get(period_key)
            if not entry:
                # allow missing; not a conflict
                continue
            # Support both single class per period or a list (if multi-class assignment allowed)
            # Here we expect a single assignment per period. If user expects multiple simultaneous classes,
            # this check would need to change.
            if isinstance(entry, dict):
                teacher = entry.get("teacher")
                if teacher is None:
                    continue
                # check other classes in same period across timetable for same teacher
                for other_class, other_entry in day_schedule.items():
                    # skip same period_key check
                    pass
            else:
                # ignore other formats
                continue
 
    # More in-depth conflict detection:
    # Build map: (day, period) -> list of teachers assigned (we expect each teacher assigned at most once)
    assignment_map = {}
    for day, day_sched in tt.items():
        if not isinstance(day_sched, dict):
            continue
        for period_label, assignment in day_sched.items():
            if not isinstance(assignment, dict):
                continue
            teacher = assignment.get("teacher")
            if not teacher:
                continue
            key = (day, period_label, teacher)
            assignment_map.setdefault((day, period_label), []).append((teacher, assignment.get("class")))
 
    # find teachers that appear >1 in same day/period
    conflict_msgs = []
    for (day, period_label), teacher_list in assignment_map.items():
        # teacher_list is list of tuples (teacher, class)
        seen = {}
        for teacher, cls in teacher_list:
            seen.setdefault(teacher, []).append(cls)
        for teacher, classes_assigned in seen.items():
            if len(classes_assigned) > 1:
                conflict_msgs.append(f"Teacher '{teacher}' assigned to multiple classes {classes_assigned} on {day} {period_label}")
 
    if conflict_msgs:
        raise ValueError("; ".join(conflict_msgs))
 
# ---------- health check ----------
@app.get("/health", summary="Health check")
async def health():
    return {"status": "ok", "gemini_key_present": bool(GEMINI_API_KEY)}
 
# ---------- run guard ----------
# Note: Use `uvicorn app:app --reload` to run locally
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
 
 