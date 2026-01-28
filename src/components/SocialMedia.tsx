import type React from "react";
import { useState, useRef, useEffect } from "react";
import { X, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Position {
  x: number;
  y: number;
}

interface SocialMediaLink {
  name: string;
  icon: React.ReactNode;
  id: string;
  url?: string; // Optional URL for navigation
}

export default function SocialMediaWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>({
    x: window.innerWidth - 80,
    y: window.innerHeight - 80,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  const WeChatIcon = () => (
    <img
      src="https://img.freepik.com/premium-vector/wechat-icon_578229-193.jpg"
      alt="WeChat"
      className="h-5 w-5"
    />
  );

  const KakaoTalkIcon = () => (
    <img
      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlsdsNDm5BOZKvhE2JEaNHkEp65Ebs4gkYxQ&s"
      alt="KakaoTalk"
      className="h-5 w-5"
    />
  );

  const KakaoChannelIcon = () => (
    <img
      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8uGdjTLsA62BeCGg2Yezs_nQYx9KoM5O3Uw&s"
      alt="KakaoChannel"
      className="h-5 w-5"
    />
  );

  const WhatsAppIcon = () => (
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
      alt="WhatsApp"
      className="h-5 w-5"
    />
  );

  // Social media links with icons and navigation URLs
  const socialMediaLinks: SocialMediaLink[] = [
    {
      name: "WeChat",
      icon: <WeChatIcon />,
      id: "mirrasia_hk",
    },
    {
      name: "Kakao Talk",
      icon: <KakaoTalkIcon />,
      id: "mirrasia",
    },
    {
      name: "Kakao Channel",
      icon: <KakaoChannelIcon />,
      id: "Click Here",
      url: "https://pf.kakao.com/_KxmnZT",
    },
    {
      name: "WhatsApp",
      icon: <WhatsAppIcon />,
      id: "Chat Now",
      url: "https://wa.me/message/NCJZUHC4TEPSG1",
    },
  ];

  // Handle dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (widgetRef.current) {
      const rect = widgetRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && widgetRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      const maxX = window.innerWidth - widgetRef.current.offsetWidth;
      const maxY = window.innerHeight - widgetRef.current.offsetHeight;

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  // Handle navigation to social media links
  const handleSocialMediaClick = (link: SocialMediaLink) => {
    if (link.url) {
      window.open(link.url, "_blank", "noopener,noreferrer");
    } else {
      console.log(`Clicked ${link.name} with ID: ${link.id}`);
    }
  };

  const showAbove = position.y > window.innerHeight / 2;

  return (
    <div
      ref={widgetRef}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 50,
      }}
      className="select-none"
    >
      {isOpen && (
        <div
          className="w-[300px] rounded-lg border bg-background shadow-lg"
          style={{
            position: "absolute",
            bottom: showAbove ? "100%" : "auto",
            top: showAbove ? "auto" : "100%",
            right: "0",
            marginBottom: showAbove ? "8px" : "0",
            marginTop: showAbove ? "0" : "8px",
          }}
        >
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="font-semibold">Connect With Us</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {socialMediaLinks.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 cursor-pointer hover:bg-muted p-2 rounded"
                  onClick={() => handleSocialMediaClick(link)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {link.icon}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{link.name}</p>
                    <p className={link.url ? "text-primary hover:underline" : "text-muted-foreground"}>
                      {link.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <Button
        onMouseDown={handleMouseDown}
        onClick={() => !isDragging && setIsOpen(!isOpen)}
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg bg-white"
      >
        <Share2 className="h-6 w-6 text-gray-700" />
      </Button>
    </div>
  );
}
