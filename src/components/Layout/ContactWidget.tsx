import { useState } from "react";
import { ChevronLeft, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Platform = "whatsapp" | "telegram";

type ChannelAction =
  | { type: "link"; url: string }
  | { type: "modal"; platform: Platform };

interface Channel {
  name: string;
  ariaLabel: string;
  Icon: React.FC<{ className?: string }>;
  action: ChannelAction;
}

interface Consultant {
  name: string;
  img: string;
  whatsapp: string;
  telegram: string;
}

const CONSULTANT_DATA: Record<string, Consultant> = {
  Simon: {
    name: "Simon",
    img: "https://static.wixstatic.com/media/853688_5efebd15c97a48dab2bd8d730a1c9c82~mv2.png",
    whatsapp:
      "https://api.whatsapp.com/send/?phone=85294968804&text&type=phone_number&app_absent=0",
    telegram: "https://t.me/mirrasia1",
  },
  Hannah: {
    name: "Hannah",
    img: "https://static.wixstatic.com/media/853688_2d594c5c03c64d48947f6453b969f554~mv2.png",
    whatsapp:
      "https://api.whatsapp.com/send/?phone=85290218363&text&type=phone_number&app_absent=0",
    telegram: "https://t.me/mirrasia_hannah",
  },
  Gina: {
    name: "Gina",
    img: "https://static.wixstatic.com/media/853688_d20f665bc76f4fb6afaa6ec6725998af~mv2.png",
    whatsapp:
      "https://api.whatsapp.com/send/?phone=821049601551&text&type=phone_number&app_absent=0",
    telegram: "https://t.me/Mirrasia_cs2",
  },
  Ayla: {
    name: "Ayla",
    img: "https://static.wixstatic.com/media/853688_b3af936d23a24f6aa56105b2e76583c3~mv2.png",
    whatsapp:
      "https://api.whatsapp.com/send/?phone=821085520586&text&type=phone_number&app_absent=0",
    telegram: "https://t.me/MIRRASIACS",
  },
  Sita: {
    name: "Sita",
    img: "https://static.wixstatic.com/media/853688_9d3602d61df947599b72edc9ef1eb3ca~mv2.png",
    whatsapp:
      "https://api.whatsapp.com/send/?phone=85284003574&text&type=phone_number&app_absent=0",
    telegram: "https://t.me/+85284003574",
  },
};

interface LanguageOption {
  key: string;
  flag: string;
  consultants: string[];
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { key: "English", flag: "🇬🇧", consultants: ["Simon", "Hannah", "Sita"] },
  { key: "Korean", flag: "🇰🇷", consultants: ["Simon", "Hannah", "Ayla", "Gina"] },
  { key: "Mandarin", flag: "🇨🇳", consultants: ["Hannah"] },
  { key: "Cantonese", flag: "🇭🇰", consultants: ["Sita"] },
  { key: "Japanese", flag: "🇯🇵", consultants: ["Simon"] },
];

const KakaoTalkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <path
      fill="#FEE500"
      d="M32 12c-11.6 0-21 7.5-21 16.8 0 5.1 3 9.6 7.7 12.6l-2.1 6.3 7.5-4.1c2.4.6 5 1 7.9 1 11.6 0 21-7.5 21-16.8S43.6 12 32 12z"
    />
    <text
      x="32"
      y="34"
      textAnchor="middle"
      fill="#391B1B"
      fontWeight="900"
      fontSize="11"
      fontFamily="sans-serif"
    >
      TALK
    </text>
  </svg>
);

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <path
      fill="#25D366"
      d="M32 12c-11 0-20 9-20 20 0 3.5.9 6.9 2.6 9.9L12 52l10.4-2.5c2.9 1.6 6.2 2.5 9.6 2.5 11 0 20-9 20-20s-9-20-20-20zm11.5 28.4c-.5 1.4-2.7 2.6-3.7 2.7-1 .1-1 .8-6.3-1.3-5.3-2.1-8.6-7.6-8.9-8s-2.1-2.8-2.1-5.3c0-2.6 1.3-3.8 1.8-4.4.5-.5 1.1-.6 1.4-.6h1c.3 0 .8-.1 1.2.9.5 1.2 1.5 4.2 1.6 4.5.1.3.2.6 0 1-.2.4-.3.6-.6.9l-.9 1c-.3.3-.6.6-.3 1.2.3.6 1.5 2.4 3.2 3.9 2.2 2 4 2.6 4.6 2.9.6.3.9.2 1.2-.1.3-.4 1.4-1.6 1.8-2.2.4-.6.8-.5 1.3-.3.5.2 3.3 1.5 3.9 1.8.6.3 1 .5 1.1.7.1.4.1 1.6-.4 3.0z"
    />
  </svg>
);

const TelegramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <circle cx="32" cy="32" r="20" fill="#229ED9" />
    <path
      fill="#ffffff"
      d="M44.6 22.3 22.4 31c-1.5.6-1.5 1.5-.3 1.9l5.7 1.8 13.2-8.3c.6-.4 1.2-.2.7.3l-10.7 9.7-.4 5.9c.6 0 .9-.3 1.2-.6l2.8-2.7 5.8 4.3c1.1.6 1.8.3 2.1-1l3.8-17.9c.4-1.6-.6-2.4-1.7-1.9z"
    />
  </svg>
);

const CHANNELS: Channel[] = [
  {
    name: "KakaoTalk",
    ariaLabel: "Open KakaoTalk chat",
    Icon: KakaoTalkIcon,
    action: { type: "link", url: "https://pf.kakao.com/_KxmnZT/chat" },
  },
  {
    name: "WhatsApp",
    ariaLabel: "Open WhatsApp consultant picker",
    Icon: WhatsAppIcon,
    action: { type: "modal", platform: "whatsapp" },
  },
  {
    name: "Telegram",
    ariaLabel: "Open Telegram consultant picker",
    Icon: TelegramIcon,
    action: { type: "modal", platform: "telegram" },
  },
];

interface CapsuleProps {
  onModalOpen: (platform: Platform) => void;
  className?: string;
}

const Capsule: React.FC<CapsuleProps> = ({ onModalOpen, className }) => (
  <div
    className={cn(
      "inline-flex items-center gap-1 h-9 px-2 rounded-full bg-background border border-border shadow-sm",
      className
    )}
  >
    {CHANNELS.map(({ name, ariaLabel, Icon, action }) => {
      const iconNode = <Icon className="h-5 w-5" />;
      const baseBtn =
        "inline-flex items-center justify-center h-7 w-7 rounded-full hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
      if (action.type === "link") {
        return (
          <a
            key={name}
            href={action.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ariaLabel}
            title={name}
            className={baseBtn}
          >
            {iconNode}
          </a>
        );
      }
      return (
        <button
          key={name}
          type="button"
          aria-label={ariaLabel}
          title={name}
          onClick={() => onModalOpen(action.platform)}
          className={baseBtn}
        >
          {iconNode}
        </button>
      );
    })}
  </div>
);

interface ContactWidgetProps {
  variant?: "capsule" | "popover";
}

export default function ContactWidget({ variant = "capsule" }: ContactWidgetProps) {
  const { t } = useTranslation();
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [language, setLanguage] = useState<string | null>(null);

  const dialogOpen = platform !== null;

  const handleModalOpen = (next: Platform) => {
    setPlatform(next);
    setLanguage(null);
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setPlatform(null);
      setLanguage(null);
    }
  };

  const activeLanguage = LANGUAGE_OPTIONS.find((l) => l.key === language) ?? null;

  return (
    <>
      {variant === "capsule" ? (
        <Capsule onModalOpen={handleModalOpen} />
      ) : (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={t("contact.open", "Contact us")}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-2">
            <Capsule onModalOpen={handleModalOpen} className="border-0 shadow-none" />
          </PopoverContent>
        </Popover>
      )}

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              {language ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => setLanguage(null)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t("contact.back", "Back")}
                </Button>
              ) : (
                <span className="h-8" />
              )}
            </div>
            <DialogTitle className="text-center">
              {language
                ? t("contact.selectConsultant", "Select Consultant")
                : t("contact.selectLanguage", "Select Language")}
            </DialogTitle>
          </DialogHeader>

          {!language && (
            <div className="flex flex-col gap-2">
              {LANGUAGE_OPTIONS.map((option) => (
                <Button
                  key={option.key}
                  type="button"
                  variant="outline"
                  className="justify-start h-auto py-3 text-sm font-medium"
                  onClick={() => setLanguage(option.key)}
                >
                  <span className="mr-3 text-base">{option.flag}</span>
                  {t(`contact.lang.${option.key}`, option.key)}
                </Button>
              ))}
            </div>
          )}

          {activeLanguage && platform && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {activeLanguage.consultants.map((name) => {
                const c = CONSULTANT_DATA[name];
                if (!c) return null;
                const href = platform === "whatsapp" ? c.whatsapp : c.telegram;
                return (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-3 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors"
                  >
                    <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-border bg-muted mb-2">
                      <img
                        src={c.img}
                        alt={c.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {c.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("contact.role", "Consultant")}
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
