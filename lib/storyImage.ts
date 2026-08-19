"use client";

// Renders a vertical 1080x1920 "story card" for the aluna's workout and
// tries to hand it to the native share sheet via the Web Share API (item 3).
//
// Real, deep Instagram Stories integration ("share directly to the Stories
// camera") isn't reachable from a plain web app without a native app-store
// app — there's no public web API for it. This implements the honest web
// equivalent: generate the image client-side, then use
// `navigator.share({ files })` so the user's OS share sheet appears; on a
// phone with Instagram installed, "Instagram" (Stories included) is one of
// the options the OS offers. Where Web Share with files isn't supported
// (most desktop browsers), it falls back to downloading the PNG so the user
// can upload it manually.

export interface StoryCardInput {
  alunaName: string;
  instagram: string; // without leading "@", may be empty
  treinoName: string;
  foco: string;
  exerciseCount: number;
}

const W = 1080;
const H = 1920;

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function renderStoryCard(input: StoryCardInput): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_unsupported");

  // Background — same terracota gradient used across the app's primary CTAs.
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#CD8468");
  bg.addColorStop(1, "#8A3B2C");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Soft decorative circle.
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.beginPath();
  ctx.arc(W * 0.85, H * 0.15, 340, 0, Math.PI * 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.restore();

  // Wordmark.
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.font = "600 64px Georgia, 'Times New Roman', serif";
  ctx.fillText("Tropa da Lari", W / 2, 260);

  ctx.font = "400 34px Arial, sans-serif";
  ctx.globalAlpha = 0.85;
  ctx.fillText("Ficha de treino personalizada", W / 2, 320);
  ctx.globalAlpha = 1;

  // Card.
  const cardX = 90;
  const cardY = 560;
  const cardW = W - cardX * 2;
  const cardH = 820;
  ctx.fillStyle = "rgba(255,255,255,0.97)";
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 40);
  ctx.fill();

  ctx.fillStyle = "#3A342E";
  ctx.font = "700 58px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "left";
  wrapText(ctx, input.alunaName, cardX + 60, cardY + 120, cardW - 120, 66);

  if (input.instagram) {
    ctx.fillStyle = "#A15840";
    ctx.font = "600 40px Arial, sans-serif";
    ctx.fillText(`@${input.instagram}`, cardX + 60, cardY + 190);
  }

  ctx.strokeStyle = "#E9DED2";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cardX + 60, cardY + 250);
  ctx.lineTo(cardX + cardW - 60, cardY + 250);
  ctx.stroke();

  ctx.fillStyle = "#8C7F70";
  ctx.font = "600 32px Arial, sans-serif";
  ctx.fillText("TREINO", cardX + 60, cardY + 320);

  ctx.fillStyle = "#3A342E";
  ctx.font = "700 50px Arial, sans-serif";
  wrapText(ctx, input.treinoName, cardX + 60, cardY + 390, cardW - 120, 58);

  ctx.fillStyle = "#6F7D5E";
  ctx.font = "600 40px Arial, sans-serif";
  ctx.fillText(`Foco: ${input.foco}`, cardX + 60, cardY + 480);
  ctx.fillText(
    `${input.exerciseCount} exercício${input.exerciseCount === 1 ? "" : "s"}`,
    cardX + 60,
    cardY + 540
  );

  ctx.fillStyle = "#BC6B52";
  ctx.font = "italic 400 34px Georgia, serif";
  wrapText(
    ctx,
    `Treino de ${input.alunaName.split(" ")[0]} • ${input.foco} • ${input.exerciseCount} exercícios`,
    cardX + 60,
    cardY + cardH - 90,
    cardW - 120,
    44
  );

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "600 32px Arial, sans-serif";
  ctx.fillText("@tropadalari", W / 2, H - 110);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("toBlob_failed"));
    }, "image/png");
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let cy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = word;
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
}

export type ShareStoryResult = { via: "share" } | { via: "download" };

// Tries the native share sheet first (so the user can pick Instagram
// Stories if their phone/browser supports sharing files); falls back to
// triggering a download of the PNG when Web Share with files isn't
// available, e.g. most desktop browsers.
export async function shareStoryCard(input: StoryCardInput): Promise<ShareStoryResult> {
  const blob = await renderStoryCard(input);
  const file = new File([blob], "tropa-da-lari-story.png", { type: "image/png" });

  const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean; share?: (data: ShareData) => Promise<void> };
  if (nav.canShare && nav.share && nav.canShare({ files: [file] })) {
    await nav.share({ files: [file], title: "Tropa da Lari", text: `Treino de ${input.alunaName}` });
    return { via: "share" };
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tropa-da-lari-story.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return { via: "download" };
}
