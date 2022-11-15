import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

const SquareClient = dynamic(async () => Square, { ssr: false });

export default function SquareWrapper() {
  return <SquareClient />;
}

function Square() {
  const router = useRouter();
  const token = Cookies.get("spotifyAuthToken");
  if (!token) {
    router.replace("/");
  }
  const [urls, setUrls] = useState<string[]>();

  useEffect(() => {
    getUrls("long_term").then((result) => setUrls(result)); //medium_term & long_term
  }, []);

  if (!urls) {
    return <div>Loading</div>;
  }

  return <Tiles urls={urls} tileHeight={3} tileWidth={3} className="w-[30rem]" />;// {number = tile}
}
//make button that converts canvas(tiles) to image (jpg) and then begins download
//const saveableImage = canvasRef.current.toDataURL('image/jpeg',1.0);
async function getUrls(
  timeRange: "short_term" | "medium_term" | "long_term"
) {
  const token = Cookies.get("spotifyAuthToken");
  const topTracksRes = await fetch(
    `https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${timeRange}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const topTracks = await topTracksRes.json();
  type Album = { images: { url: string }[] }
  const albums = topTracks.items.map(({ album }: {album: Album}) => album);
  const resultAlbums: Album[] = [];
  const seenAlbums = new Set();
  for (const album of albums) {
    if (!seenAlbums.has(album.name)) {
      seenAlbums.add(album.name);
      resultAlbums.push(album);
    }
  }

  // It will always have a url just to make TS happy
  return resultAlbums.map(({ images }) => images[0]?.url ?? "");
}

type TileProps = {
  urls: string[];
  tileHeight: number;
  tileWidth: number;
  className?: string;
};
function Tiles({ urls, tileHeight, tileWidth, className = "" }: TileProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !urls) {
      return;
    }
    canvas.height = (canvas.width / tileWidth) * tileHeight;
    console.log(canvas.width, canvas.height)
    const ctx = canvas.getContext("2d");
    const nineUrls = urls.slice(0, tileHeight * tileWidth);
    for (const [i, url] of nineUrls.entries()) {
      const image = new Image();
      image.src = url;
      image.onload = () => {
        ctx?.drawImage(
          image,
          ((i % tileWidth) * canvas.width) / tileWidth,
          (Math.floor(i / tileWidth) * canvas.height) / tileHeight,
          canvas.width / tileWidth,
          canvas.height / tileHeight
        );
      };
    }
  }, [canvasRef, urls, tileWidth, tileHeight]);
 
  return <canvas width="3000"ref={canvasRef} className={className}/>;
  
}


