import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const usePages = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    // URL の ?page= を初期値にする（無い・不正な場合は 1）
    const initialPage = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1)
    const [offsetCurrentPage, setOffsetCurrentPage] = useState<number>(initialPage);

    const clickPage = async (num: number) => {
        setOffsetCurrentPage(num);
        router.push(`?page=${num}`, { scroll: false });
    }

    return {
        offsetCurrentPage,
        setOffsetCurrentPage,
        clickPage
    }
}
