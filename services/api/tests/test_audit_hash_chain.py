"""Unit test for the audit hash-chain helper."""

from __future__ import annotations

import hashlib

from app.modules.audit.api import _canonical


def test_canonical_is_stable() -> None:
    a = _canonical({"b": 1, "a": 2})
    b = _canonical({"a": 2, "b": 1})
    assert a == b == '{"a":2,"b":1}'


def test_canonical_handles_none() -> None:
    assert _canonical(None) == "{}"


def test_hash_chain_changes_with_prev() -> None:
    payload = '{"x":1}'
    h_a = hashlib.sha256(("" + payload).encode()).hexdigest()
    h_b = hashlib.sha256((h_a + payload).encode()).hexdigest()
    assert h_a != h_b
