#!/usr/bin/env python3
"""
AI Environment Verification Script
Tests that DeepFace, TensorFlow, tf-keras, and OpenCV are correctly installed
and operational. Run via:
    python test_ai.py
"""
import sys
import time

PASS = "\033[92m[PASS]\033[0m"
FAIL = "\033[91m[FAIL]\033[0m"
INFO = "\033[94m[INFO]\033[0m"


def test(label, fn):
    try:
        result = fn()
        print(f"{PASS} {label}" + (f" — {result}" if result else ""))
        return True
    except Exception as e:
        print(f"{FAIL} {label} — {e}")
        return False


print(f"\n{INFO} Python {sys.version}\n{'='*60}")

# ── 1. NumPy ──────────────────────────────────────────────────
test("NumPy import", lambda: __import__("numpy").__version__)

# ── 2. OpenCV ─────────────────────────────────────────────────
test("OpenCV import", lambda: __import__("cv2").__version__)

# ── 3. TensorFlow ─────────────────────────────────────────────
tf_ok = test("TensorFlow import", lambda: __import__("tensorflow").__version__)

# ── 4. tf-keras ───────────────────────────────────────────────
test("tf-keras import", lambda: __import__("tf_keras").__version__)

# ── 5. DeepFace import (no model load yet) ────────────────────
deepface_ok = test("DeepFace import", lambda: (
    __import__("deepface.DeepFace", fromlist=["DeepFace"]) and "imported"
))

# ── 6. DeepFace model load (downloads weights if missing) ─────
if deepface_ok:
    print(f"\n{INFO} Loading DeepFace model (may download weights ~100MB first run)...")
    t0 = time.time()
    def _load_deepface():
        import numpy as np
        from deepface import DeepFace
        # Tiny 48x48 black image — just enough to trigger model load
        dummy = np.zeros((48, 48, 3), dtype=np.uint8)
        DeepFace.represent(dummy, model_name="Facenet", enforce_detection=False)
        return f"{time.time()-t0:.1f}s"
    test("DeepFace Facenet model load", _load_deepface)

# ── 7. Memory check ───────────────────────────────────────────
def _memory():
    import subprocess
    out = subprocess.check_output(["free", "-h"], text=True)
    lines = [l for l in out.splitlines() if l.startswith("Mem") or l.startswith("Swap")]
    return "\n         " + "\n         ".join(lines)

test("System memory", _memory)

print(f"\n{'='*60}\n{INFO} Done.\n")
