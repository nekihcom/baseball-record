import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
};

export default function PrivacyPage() {
  return (
    <div className="py-8 space-y-8 text-sm" style={{ color: "#94a3b8", lineHeight: 1.8 }}>
      <h1 className="text-xl font-bold" style={{ color: "#f1f5f9" }}>プライバシーポリシー</h1>
      <p style={{ color: "#64748b" }}>最終更新日: 2026年3月14日</p>

      <section className="space-y-2">
        <h2 className="font-semibold" style={{ color: "#e2e8f0" }}>1. 収集する情報</h2>
        <p>本サービスでは、ユーザーの個人情報を直接収集・保存しません。</p>
        <p>ただし、以下の情報が第三者サービスによって収集される場合があります。</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>
            <strong style={{ color: "#e2e8f0" }}>Vercel Analytics</strong>: ページビュー・リファラーなどの匿名アクセスログ
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold" style={{ color: "#e2e8f0" }}>2. Cookie・ローカルストレージ</h2>
        <p>
          本サービスは認証機能を持たないため、ログイン目的の Cookie は使用しません。
          Vercel Analytics による匿名計測のみ行われます。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold" style={{ color: "#e2e8f0" }}>3. 掲載データについて</h2>
        <p>
          本サービスは、草野球チームが公開している試合結果・選手成績を収集・表示しています。
          氏名などの個人情報が含まれる場合がありますが、これらはすでに公開された情報に限ります。
          掲載情報の削除を希望される方はフッターのお問い合わせよりご連絡ください。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold" style={{ color: "#e2e8f0" }}>4. 第三者サービス</h2>
        <p>本サービスは以下の第三者サービスを利用しています。</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Supabase（データベース）: データ管理に使用。アクセスは読み取り専用ポリシーで制限されています。</li>
          <li>Vercel（ホスティング・Analytics）: サービス提供および匿名アクセス計測に使用。</li>
          <li>Google Fonts（フォント）: フォントファイルの配信に使用。</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold" style={{ color: "#e2e8f0" }}>5. ポリシーの変更</h2>
        <p>
          本ポリシーは予告なく変更する場合があります。
          変更後のポリシーは本ページに掲載した時点で効力を生じます。
        </p>
      </section>
    </div>
  );
}
