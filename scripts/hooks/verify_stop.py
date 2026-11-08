"""Opt-in Codex Stop verification; Python standard library only."""
import json
import os
from pathlib import Path
import signal
import subprocess
import sys


def load(root):
    path = root / '.bugri-hooks/state.json'
    return json.loads(path.read_text()) if path.exists() else {}


def save(root, state):
    directory = root / '.bugri-hooks'
    directory.mkdir(exist_ok=True)
    temporary = directory / 'state.tmp'
    temporary.write_text(json.dumps(state, ensure_ascii=False))
    temporary.replace(directory / 'state.json')


def verify(root, attempt):
    with (root / f'.bugri-hooks/verify-{attempt}.log').open('w') as log:
        try:
            process = subprocess.Popen(
                ['npm', 'run', 'verify'], cwd=root, stdout=log,
                stderr=subprocess.STDOUT, start_new_session=True,
            )
        except OSError as error:
            log.write(str(error))
            return 127
        try:
            return process.wait(timeout=600)
        except subprocess.TimeoutExpired:
            os.killpg(process.pid, signal.SIGKILL)
            process.wait()
            log.write('\nVerification timed out after 600 seconds.\n')
            return 124


def stop(root, event):
    state = load(root)
    if not state.get('active'):
        return {}
    session = event.get('session_id', '')
    if state.get('session') and state['session'] != session:
        return {}
    state['session'] = session
    state['attempts'] += 1
    # Persist before starting the process so interruptions cannot reset the budget.
    if state['attempts'] > 4:
        state['active'] = False
        save(root, state)
        return {'decision': 'block', 'reason': '검증 실행이 중단되었습니다. 추가 수정 없이 로그와 차단 사유를 보고하세요. DONE으로 표시하지 마세요.'}
    save(root, state)
    code = verify(root, state['attempts'])
    state['exit_code'] = code
    state['active'] = code != 0 and state['attempts'] < 4
    save(root, state)
    if code == 0:
        return {'systemMessage': f"Bugri verify 통과: {state['task']}"}
    log = f".bugri-hooks/verify-{state['attempts']}.log"
    if state['active']:
        instruction = '원인을 분석하고 구현을 수정한 뒤 관련 테스트를 실행하세요. 다음 종료 시 전체 검증을 다시 실행합니다. 기대값을 임의 변경하거나 검사를 약화하지 마세요.'
    else:
        instruction = '최초 검증과 수정 후 재검증 3회가 실패했습니다. 추가 수정 없이 원인·시도 내용·차단 요인을 보고하세요.'
    return {'decision': 'block', 'reason': f'npm run verify 실패(exit {code}). {log}를 읽으세요. {instruction} DONE으로 표시하지 말고 PR은 Draft로 유지하세요. 환경 문제라면 blocked 명령으로 사유를 기록하고 종료하세요.'}


def main():
    event = json.load(sys.stdin) if len(sys.argv) == 1 else {}
    root = Path(subprocess.check_output(
        ['git', 'rev-parse', '--show-toplevel'], cwd=event.get('cwd'), text=True,
    ).strip())
    if len(sys.argv) == 1:
        print(json.dumps(stop(root, event), ensure_ascii=False))
        return
    command = sys.argv[1]
    value = ' '.join(sys.argv[2:]).strip()
    if command == 'arm' and value:
        previous = load(root)
        if previous.get('active'):
            raise SystemExit('이미 활성화되어 있습니다. 재시도 횟수를 초기화하지 마세요.')
        save(root, {'task': value, 'active': True, 'attempts': 0})
    elif command == 'blocked' and value:
        state = load(root)
        state.update(active=False, blocker=value)
        save(root, state)
    elif command != 'status':
        raise SystemExit('Usage: verify_stop.py arm TASK_ID | blocked REASON | status')
    print(json.dumps(load(root), ensure_ascii=False))


if __name__ == '__main__':
    main()
