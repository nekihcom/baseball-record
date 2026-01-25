"""
全てのスクレイピングスクリプトを順に実行するスクリプト
"""
import sys
import subprocess
import os


def run_script(script_path, team_names, test_mode=False):
    """
    スクリプトを実行する
    
    Args:
        script_path: 実行するスクリプトのパス（相対パスまたは絶対パス）
        team_names: チーム名のリスト
        test_mode: テストモードかどうか
    
    Returns:
        成功した場合はTrue、失敗した場合はFalse
    """
    script_name = os.path.basename(script_path)
    print("\n" + "=" * 70)
    print(f"実行中: {script_name}")
    print("=" * 70)
    
    # プロジェクトルートのパスを取得（このスクリプトのディレクトリの親ディレクトリ）
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # スクリプトパスを絶対パスに変換
    if not os.path.isabs(script_path):
        script_abs_path = os.path.join(project_root, script_path)
    else:
        script_abs_path = script_path
    
    # コマンドを構築
    cmd = [sys.executable, script_abs_path]
    cmd.extend(team_names)
    
    if test_mode:
        cmd.append('--test')
    
    try:
        # スクリプトを実行（プロジェクトルートを作業ディレクトリとして設定）
        result = subprocess.run(
            cmd,
            check=False,  # エラーでも例外を発生させない
            cwd=project_root  # プロジェクトルートに移動
        )
        
        if result.returncode == 0:
            print(f"\n✓ {script_name} が正常に完了しました")
            return True
        else:
            print(f"\n✗ {script_name} がエラーで終了しました (終了コード: {result.returncode})")
            return False
            
    except Exception as e:
        print(f"\n✗ {script_name} の実行中にエラーが発生しました: {e}")
        return False


def main():
    """メイン処理"""
    # コマンドライン引数を解析
    args = sys.argv[1:]
    
    # --testオプションのチェック
    test_mode = '--test' in args
    if test_mode:
        args.remove('--test')
    
    # チーム名を取得
    if len(args) < 1:
        print("エラー: チーム名を指定してください")
        print("使用方法: python src/00_run_all.py <チーム名> [<チーム名> ...] [--test]")
        print("例: python src/00_run_all.py orcas")
        print("例: python src/00_run_all.py orcas swallows-fan")
        print("例（テストモード）: python src/00_run_all.py orcas swallows-fan --test")
        sys.exit(1)
    
    team_names = args
    
    # チーム名のバリデーション（英数字のみ）
    for team_name in team_names:
        if not team_name.replace('_', '').replace('-', '').isalnum():
            print(f"エラー: チーム名「{team_name}」は英数字のみで指定してください")
            sys.exit(1)
    
    # 実行するスクリプトのリスト
    scripts = [
        'src/01_get_game_info.py',
        'src/02_get_game_hitter_stats.py',
        'src/03_get_game_pitcher_stats.py',
        'src/04_get_team_stats.py',
        'src/05_get_hitter_stats.py',
        'src/06_get_pitcher_stats.py',
    ]
    
    print("=" * 70)
    print("全スクレイピングスクリプトの実行を開始します")
    print(f"チーム: {', '.join(team_names)}")
    if test_mode:
        print("モード: テストモード")
    print("=" * 70)
    
    # 各スクリプトを順に実行
    results = []
    for script_path in scripts:
        success = run_script(script_path, team_names, test_mode=test_mode)
        results.append((script_path, success))
        
        # エラーが発生した場合は続行するか確認（テストモードでない場合）
        if not success and not test_mode:
            print(f"\n警告: {os.path.basename(script_path)} でエラーが発生しましたが、処理を続行します...")
    
    # 結果をまとめて表示
    print("\n" + "=" * 70)
    print("実行結果サマリー")
    print("=" * 70)
    
    success_count = sum(1 for _, success in results if success)
    total_count = len(results)
    
    for script_path, success in results:
        status = "✓ 成功" if success else "✗ 失敗"
        print(f"{status}: {os.path.basename(script_path)}")
    
    print(f"\n成功: {success_count}/{total_count}")
    
    if success_count == total_count:
        print("\n全てのスクリプトが正常に完了しました！")
        sys.exit(0)
    else:
        print(f"\n警告: {total_count - success_count}個のスクリプトでエラーが発生しました")
        sys.exit(1)


if __name__ == "__main__":
    main()
