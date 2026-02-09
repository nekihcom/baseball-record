"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useBreadcrumb } from "@/components/BreadcrumbContext";

export default function NotFound() {
  const { setHideBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    setHideBreadcrumb(true);
    return () => setHideBreadcrumb(false);
  }, [setHideBreadcrumb]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <h1 className="text-2xl font-bold text-black">
        ページが見つかりません
      </h1>
      <p className="text-xl text-black">
        URLを間違えていませんか？
      </p>
      <Link
        href="/"
        className="text-lg text-primary underline hover:text-primary/70 transition-colors"
      >
        トップへ
      </Link>
    </div>
  );
}
