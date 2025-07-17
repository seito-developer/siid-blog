import Image from "next/image";
import Link from "next/link";
import React from "react";

function BannerSiid() {
  return (
    <div style={{ display: "block", padding: "30px 15px", maxWidth: '520px', margin: '0 auto' }}>
      <Link href="https://bug-fix.org/siid" target="_blank">
        <Image
          src="/banner-1.png"
          width={300}
          height={300}
          alt="プログラミングスクール・SiiDの情報はこちら"
          style={{
            width: "100%",
            height: "auto",
          }}
        />
      </Link>
    </div>
  );
}

export default BannerSiid;
