import { useState } from "react";
import { useRouter } from "next/navigation";

export const usePages = () => {
    const router = useRouter()
    const [offsetCurrentPage, setOffsetCurrentPage] = useState<number>(0);

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