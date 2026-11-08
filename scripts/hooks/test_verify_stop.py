import importlib.util
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('verify_stop', Path(__file__).with_name('verify_stop.py'))
hook = importlib.util.module_from_spec(spec)


class StopTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        spec.loader.exec_module(hook)

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.state = {'task': 'P01', 'active': True, 'attempts': 0}
        hook.save(self.root, self.state)

    def test_unarmed_does_not_run(self):
        self.state['active'] = False
        hook.save(self.root, self.state)
        with patch.object(hook, 'verify') as run:
            self.assertEqual(hook.stop(self.root, {}), {})
            run.assert_not_called()

    def test_success_deactivates(self):
        with patch.object(hook, 'verify', return_value=0):
            self.assertEqual(hook.stop(self.root, {})['systemMessage'], 'Bugri verify 통과: P01')
        self.assertFalse(hook.load(self.root)['active'])

    def test_failure_then_success(self):
        with patch.object(hook, 'verify', side_effect=[1, 0]):
            self.assertEqual(hook.stop(self.root, {})['decision'], 'block')
            self.assertIn('systemMessage', hook.stop(self.root, {}))

    def test_initial_plus_three_retries_then_report_only(self):
        with patch.object(hook, 'verify', return_value=1) as run:
            for _ in range(4):
                self.assertEqual(hook.stop(self.root, {})['decision'], 'block')
            self.assertEqual(hook.stop(self.root, {}), {})
            self.assertEqual(run.call_count, 4)
        self.assertFalse(hook.load(self.root)['active'])

    def test_other_session_cannot_consume_attempts(self):
        with patch.object(hook, 'verify', return_value=1) as run:
            hook.stop(self.root, {'session_id': 'one'})
            self.assertEqual(hook.stop(self.root, {'session_id': 'two'}), {})
            self.assertEqual(run.call_count, 1)

    def test_worktrees_are_isolated(self):
        with tempfile.TemporaryDirectory() as other:
            with patch.object(hook, 'verify') as run:
                self.assertEqual(hook.stop(Path(other), {}), {})
                run.assert_not_called()

    def test_verify_runs_command_and_keeps_failure_log(self):
        binary = self.root / 'npm'
        binary.write_text('#!/bin/sh\necho "command: $*"\nexit 7\n')
        binary.chmod(0o755)
        with patch.dict(os.environ, {'PATH': str(self.root)}):
            self.assertEqual(hook.verify(self.root, 1), 7)
        self.assertIn('command: run verify', (self.root / '.bugri-hooks/verify-1.log').read_text())

    def test_missing_npm_is_failure(self):
        with patch.dict(os.environ, {'PATH': str(self.root)}):
            self.assertEqual(hook.verify(self.root, 1), 127)


if __name__ == '__main__':
    unittest.main()
