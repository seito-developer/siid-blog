import { BLOG_API_ENDPOINT } from "@/app/constants";
import { getBlogPosts } from "@/app/page";
import { ArticleProps } from "@/interfaces/common";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const usePages = (totalCount: number, pageSize: number) => {
    const router = useRouter()
    const [offsetCurrentPage, setOffsetCurrentPage] = useState<number>(0);
    const [posts, setPosts] = useState<ArticleProps[]>([]);

    const clickPage = async (num: number) => {
        setOffsetCurrentPage(num);
        // const { posts } = await getBlogPosts(num);
        // setPosts(posts);
        router.push(`/${BLOG_API_ENDPOINT}/${num}`, { scroll: false });
    }

    // useEffect(() => {
    //     const fetchInitialPosts = async () => {
    //         const { posts } = await getBlogPosts(0);
    //         setPosts(posts);
    //     };
    //     setPosts()
    //     fetchInitialPosts();
    // }, [posts]);

    return {
        offsetCurrentPage,
        setOffsetCurrentPage,
        clickPage
    }
}