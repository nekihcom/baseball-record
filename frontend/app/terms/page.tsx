import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約",
};

export default function TermsPage() {
  return (
    <div className="py-8 space-y-8 text-sm" style={{ color: "#94a3b8", lineHeight: 1.8 }}>
      <h1 className="text-xl font-bold" style={{ color: "#f1f5f9" }}>利用規約</h1>
      <p style={{ color: "#64748b" }}>最終更新日: 2026年3月14日</p>

      <section className="space-y-2">
        <h2 className="font-semibold" style={{ color: "#e2e8f0" }}>1. サービスの目的</h2>
        <p>
          本サービス「草野球レポート」（以下「本サービス」）は、草野球チームの試合結果・選手成績を記録・公開することを目的としています。
          掲載データは公開されている外部サイトから取得したものです。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold" style={{ color: "#e2e8f0" }}>2. 免責事項</h2>
        <p>
          本サービスが提供するデータの正確性・完全性について、いかなる保証も行いません。
          データの誤りや欠落が生じても、当方は一切の責任を負いません。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold" style={{ color: "#e2e8f0" }}>3. 著作権・第三者データについて</h2>
        <p>
          本サービスに掲載する試合記録・成績データは、各チームが公開している情報を基に作成しています。
          当該データの著作権は各チームおよびその関係者に帰属します。
          掲載内容に異議・削除要請がある場合は、フッターのお問い合わせよりご連絡ください。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold" style={{ color: "#e2e8f0" }}>4. 禁止事項</h2>
        <p>以下の行為を禁止します。</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>本サービスへの不正アクセス・負荷を与える行為</li>
          <li>掲載データの無断商用利用</li>
          <li>本サービスを通じた違法行為</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold" style={{ color: "#e2e8f0" }}>5. 規約の変更</h2>
        <p>
          本規約は予告なく変更する場合があります。
          変更後の規約は本ページに掲載した時点で効力を生じます。
        </p>
      </section>
    </div>
  );
}
