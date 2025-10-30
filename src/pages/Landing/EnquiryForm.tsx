/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { reqEnquiry } from "@/lib/api/FetchData";
import { t } from "i18next";
import { toast } from "@/hooks/use-toast";

// .env (Vite): VITE_RECAPTCHA_SITE_KEY=xxxx
const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string;

type Props = { className?: string };

export default function EnquiryFormModern({ className = "" }: Props) {
    // form state
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [agree, setAgree] = useState(false);
    // honeypot
    const homepageRef = useRef<HTMLInputElement>(null);

    // ui state
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

    // errors
    const [errName, setErrName] = useState(false);
    const [errPhone, setErrPhone] = useState(false);
    const [errEmail, setErrEmail] = useState(false);
    const [errMsg, setErrMsg] = useState(false);
    const [errAgree, setErrAgree] = useState(false);
    const [errGlobal, setErrGlobal] = useState<string | null>(null);

    const msgCount = useMemo(() => `${message.length}/1000`, [message]);

    const emailValid = (val: string) => /^\S+@\S+\.\S+$/.test(val);
    const phoneValid = (val: string) =>
        val.trim() === "" || /^[+0-9()\-\s]{8,20}$/.test(val);

    const validate = () => {
        let ok = true;

        // Name
        if (!name.trim()) {
            setErrName(true);
            ok = false;
        } else setErrName(false);

        // Email
        if (!emailValid(email)) {
            setErrEmail(true);
            ok = false;
        } else setErrEmail(false);

        // Phone (optional)
        if (!phoneValid(phone)) {
            setErrPhone(true);
            ok = false;
        } else setErrPhone(false);

        // Message (10~1000 chars)
        if (!(message.trim().length >= 10 && message.trim().length <= 1000)) {
            setErrMsg(true);
            ok = false;
        } else setErrMsg(false);

        // Consent
        if (!agree) {
            setErrAgree(true);
            ok = false;
        } else setErrAgree(false);

        // reCAPTCHA
        if (!SITE_KEY) {
            setErrGlobal("reCAPTCHA site key is missing.");
            ok = false;
        } else if (!recaptchaToken) {
            setErrGlobal("Please complete the reCAPTCHA.");
            ok = false;
        } else setErrGlobal(null);

        return ok;
    };

    const resetForm = () => {
        setName("");
        setPhone("");
        setEmail("");
        setMessage("");
        setAgree(false);
        setRecaptchaToken(null);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(false);

        // honeypot
        if (homepageRef.current?.value) return;

        if (!validate()) return;

        try {
            setSubmitting(true);
            const res = await reqEnquiry({
                name: name.trim(),
                phone: phone.trim(),
                email: email.trim(),
                message: message.trim(),
                recaptchaToken,
            });
            // console.log("res", res);
            if (!res.isValid) {
                toast({
                    title: "Error",
                    description: res.message  || "An error occurred. Please try again later.",
                    variant: "destructive",
                })
            }

            resetForm();
            setSuccess(true);
        } catch (err: any) {
            setErrGlobal(err?.message || "An error occurred. Please try again later.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section
            aria-labelledby="form-title"
            className={[
                // card container styled to match the sample
                "w-full max-w-[560px] rounded-[14px] border border-slate-300/30 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.15)]",
                "backdrop-saturate-[1.2] backdrop-blur-[6px]",
                "dark:bg-slate-900/90 dark:border-slate-700/60 dark:shadow-[0_10px_30px_rgba(0,0,0,0.40)]",
                "p-[clamp(20px,4vw,32px)]",
                className,
            ].join(" ")}
        >
            <h1 id="form-title" className="text-[clamp(22px,2.2vw+14px,28px)] font-semibold tracking-[-0.01em] mb-2">
                {t("landingPage.title", "Request a Free Consultation")}
            </h1>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-5">
                {/* Required fields are marked with <strong>•</strong>. Our team will contact you shortly. */}
                {t("landingPage.subtitle")}
            </p>

            {errGlobal && (
                <div className="mb-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-2 text-sm">
                    {errGlobal}
                </div>
            )}

            <form onSubmit={onSubmit} noValidate className="grid gap-[14px]">
                {/* honeypot (hidden but focusable off-screen) */}
                <div className="absolute -left-[5000px] w-px h-px overflow-hidden">
                    <label htmlFor="homepage">{t("landingPage.honeypot.label")}</label>
                    <input id="homepage" name="homepage" type="text" tabIndex={-1} autoComplete="off" ref={homepageRef} />
                </div>

                {/* name + phone grid */}
                <div className="grid gap-3 sm:grid-cols-2">
                    {/* name */}
                    <div className="relative">
                        <label className="absolute left-3 top-[10px] text-[12px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-1 rounded-md -translate-y-3">

                            {t("landingPage.name.label")}
                        </label>
                        <input
                            className={[
                                "w-full rounded-[12px] border border-slate-300/70 bg-transparent px-3 py-[14px] outline-none",
                                "focus:border-[#1e60ff] focus:ring-4 focus:ring-[rgba(30,96,255,0.25)]",
                                errName ? "border-red-600" : "",
                            ].join(" ")}
                            id="name"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="name"
                            aria-required="true"
                            aria-invalid={errName ? "true" : "false"}
                            required
                        />
                        <p className={["mt-1 text-xs text-red-600", errName ? "block" : "hidden"].join(" ")}>{t("landingPage.name.error")}</p>
                    </div>

                    {/* phone */}
                    <div className="relative">
                        <label className="absolute left-3 top-[10px] text-[12px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-1 rounded-md -translate-y-3">
                            {t("landingPage.phone.label")}
                        </label>
                        <input
                            className={[
                                "w-full rounded-[12px] border border-slate-300/70 bg-transparent px-3 py-[14px] outline-none",
                                "focus:border-[#1e60ff] focus:ring-4 focus:ring-[rgba(30,96,255,0.25)]",
                                errPhone ? "border-red-600" : "",
                            ].join(" ")}
                            id="phone"
                            name="phone"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            pattern="^[+0-9()\\-\\s]{8,20}$"
                            aria-invalid={errPhone ? "true" : "false"}
                        />
                        <p className={["mt-1 text-xs text-red-600", errPhone ? "block" : "hidden"].join(" ")}>
                            {t("landingPage.phone.error")}
                        </p>
                    </div>
                </div>

                {/* email */}
                <div className="relative">
                    <label className="absolute left-3 top-[10px] text-[12px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-1 rounded-md -translate-y-3">
                        {t("landingPage.email.label")}
                    </label>
                    <input
                        className={[
                            "w-full rounded-[12px] border border-slate-300/70 bg-transparent px-3 py-[14px] outline-none",
                            "focus:border-[#1e60ff] focus:ring-4 focus:ring-[rgba(30,96,255,0.25)]",
                            errEmail ? "border-red-600" : "",
                        ].join(" ")}
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-required="true"
                        aria-invalid={errEmail ? "true" : "false"}
                        required
                    />
                    <p className={["mt-1 text-xs text-red-600", errEmail ? "block" : "hidden"].join(" ")}>
                        {t("landingPage.email.error")}
                    </p>
                </div>

                {/* message */}
                <div className="relative">
                    <label className="absolute left-3 top-[10px] text-[12px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-1 rounded-md -translate-y-3">
                        {t("landingPage.message.label")}
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        className={[
                            "w-full rounded-[12px] border border-slate-300/70 bg-transparent px-3 py-[14px] outline-none min-h-[120px] resize-y",
                            "focus:border-[#1e60ff] focus:ring-4 focus:ring-[rgba(30,96,255,0.25)]",
                            errMsg ? "border-red-600" : "",
                        ].join(" ")}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        minLength={10}
                        maxLength={1000}
                        aria-required="true"
                        aria-invalid={errMsg ? "true" : "false"}
                        required
                    />
                    <div className="mt-1 flex items-center justify-between text-[12px] text-slate-500 dark:text-slate-400" aria-live="polite">
                        <span>{t("landingPage.message.helper")}</span>
                        <span>{msgCount}</span>
                    </div>
                    <p className={["mt-1 text-xs text-red-600", errMsg ? "block" : "hidden"].join(" ")}>
                        {t("landingPage.message.error")}
                    </p>
                </div>

                {/* consent */}
                <div className="rounded-[12px] border border-dashed border-slate-300/70 p-3 text-[14px]">
                    <label className="flex gap-2 items-start leading-5">
                        <input
                            type="checkbox"
                            id="agree"
                            name="agree"
                            checked={agree}
                            onChange={(e) => setAgree(e.target.checked)}
                            aria-required="true"
                        />
                        <span>
                            {t("landingPage.consent.checkboxLabel")}{" "}
                            <a className="text-[#1e60ff] underline underline-offset-2" href="/privacy" target="_blank" rel="noopener">
                                {t("landingPage.consent.policyLinkText")}
                            </a>
                        </span>
                    </label>
                    <p className={["mt-1 text-xs text-red-600", errAgree ? "block" : "hidden"].join(" ")}>
                        {t("landingPage.consent.error")}
                    </p>
                </div>

                {/* reCAPTCHA */}
                <div className="rounded-[12px] border border-dashed border-slate-300/70 p-3" role="group" aria-label="Captcha">
                    {SITE_KEY ? (
                        <ReCAPTCHA sitekey={SITE_KEY} onChange={(t) => setRecaptchaToken(t)} />
                    ) : (
                        <>
                        </>
                    )}
                    <span className="sr-only">{t("landingPage.recaptcha.srOnly")}</span>
                </div>

                {/* actions */}
                <div className="mt-1 flex items-center justify-between gap-2">
                    <small className="text-[14px] text-slate-500 dark:text-slate-400">
                        {t("landingPage.actions.disclaimer")}
                    </small>
                    <button
                        id="submitBtn"
                        type="submit"
                        disabled={submitting}
                        className="rounded-[12px] bg-[#1e60ff] px-[18px] py-3 font-semibold text-white transition active:translate-y-px hover:bg-[#194ed1] disabled:opacity-60"
                    >
                        {submitting ? t("landingPage.actions.submitting") : t("landingPage.actions.submit")}
                    </button>
                </div>

                {/* success */}
                <div
                    id="success"
                    role="status"
                    aria-live="polite"
                    className={[
                        "mt-3 hidden rounded-[12px] bg-emerald-500/10 px-3 py-2 text-[14px] text-emerald-600",
                        success ? "!block" : "",
                    ].join(" ")}
                >
                    {t("landingPage.success")}
                </div>
            </form>
        </section>
    );
}
