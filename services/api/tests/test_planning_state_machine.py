"""Unit tests for the AWP state machine — no DB required."""

from __future__ import annotations

from app.modules.planning.service import _AWP_TRANSITIONS


def test_state_machine_has_every_status_as_key() -> None:
    expected = {
        "draft",
        "submitted",
        "under_review",
        "revisions_requested",
        "approved",
        "active",
        "closed",
    }
    assert set(_AWP_TRANSITIONS) == expected


def test_terminal_state_has_no_transitions() -> None:
    assert _AWP_TRANSITIONS["closed"] == set()


def test_submit_only_from_draft() -> None:
    for state, nexts in _AWP_TRANSITIONS.items():
        if state == "draft":
            assert "submitted" in nexts
        else:
            assert "submitted" not in nexts


def test_approval_path() -> None:
    # draft -> submitted -> under_review -> approved -> active -> closed
    path = ["draft", "submitted", "under_review", "approved", "active", "closed"]
    for src, dst in zip(path, path[1:], strict=False):
        assert dst in _AWP_TRANSITIONS[src], f"missing transition {src} -> {dst}"


def test_revision_loop() -> None:
    assert "revisions_requested" in _AWP_TRANSITIONS["submitted"]
    assert "revisions_requested" in _AWP_TRANSITIONS["under_review"]
    assert "draft" in _AWP_TRANSITIONS["revisions_requested"]
