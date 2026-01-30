import React from 'react';

interface LetterSection {
  title: string;
  html: string;
}

interface LetterPreviewProps {
  companyInfo: string;
  date: string;
  opening: string;
  sections: LetterSection[];
  signature: {
    name: string;
    role: string;
    company: string;
    address?: string;
    phone?: string;
    email?: string;
    site?: string;
  };
  twoColumn: boolean;
  isEmpty: boolean;
}

export const LetterPreview: React.FC<LetterPreviewProps> = ({
  companyInfo,
  date,
  opening,
  sections,
  signature,
  twoColumn,
  isEmpty
}) => {
  if (isEmpty) {
    return (
      <div className="border border-border rounded-xl bg-muted/30 p-12 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4 uppercase text-xs font-bold text-muted-foreground">
          ?
        </div>
        <p className="text-muted-foreground text-sm">
          Fill the form and click "Generate Letter" to see a preview.
        </p>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page { size: A4; margin: 18mm 16mm 20mm 16mm; }
          body * { visibility: hidden !important; }
          #printable-letter, #printable-letter * { visibility: visible !important; }
          #printable-letter {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
          }
          .letterhead-print { border: none !important; padding: 0 0 8px 0 !important; }
          .letter-content-print { padding: 0 !important; }
          .section-title-print { font-size: 11.5pt !important; color: #0E3A8A !important; font-family: 'Times New Roman', serif !important; }
          #printable-letter { font-family: 'Times New Roman', serif !important; }
        }
      `}} />

      <div id="printable-letter" className="preview-wrap border border-border rounded-2xl overflow-hidden bg-white shadow-sm transition-all animate-fade-in font-serif">
        <div className="letterhead p-6 pb-4 border-b border-border flex justify-between items-start letterhead-print">
          <div>
            <div className="text-xl font-black tracking-tight text-[#0E3A8A] uppercase font-sans">
              Professional Reference Letter
            </div>
            <div className="text-muted-foreground text-[13px] mt-0.5 font-sans">{companyInfo}</div>
          </div>
          <div className="text-muted-foreground text-[13px] font-medium font-sans">{date}</div>
        </div>

        <div className={`p-8 letter-content-print ${twoColumn ? 'columns-2 gap-10' : ''}`}>
          <div className="text-[12px] font-black text-[#0E3A8A] uppercase tracking-wider mb-2 section-title-print">
            TO WHOM IT MAY CONCERN
          </div>
          <p className="text-[14px] leading-relaxed mb-5 text-foreground/90">{opening}</p>

          {sections.map((section) => (
            <div key={section.title} className="break-inside-avoid mb-5">
              <div className="text-[12px] font-black text-[#0E3A8A] uppercase tracking-wider mb-1.5 section-title-print">
                {section.title}
              </div>
              <p className="text-[14px] leading-relaxed text-foreground/90">{section.html}</p>
            </div>
          ))}

          <p className="text-[14px] leading-relaxed mb-6 text-foreground/90">
            Should you require any further information, I would be pleased to assist.
          </p>

          <div className="mt-8 break-inside-avoid">
            <div className="text-[14px]">Sincerely,</div>
            <div className="h-px bg-border my-4 w-40" />
            <div className="font-extrabold text-[15px]">{signature.name}</div>
            <div className="mt-1.5 text-[13px] leading-[1.4] text-muted-foreground">
              <div className="font-semibold text-foreground/80">{signature.role}</div>
              <div>{signature.company}</div>
              {signature.address && <div>{signature.address}</div>}
              <div className="mt-1 space-y-0.5">
                {signature.phone && <div>Tel: {signature.phone}</div>}
                {signature.email && <div>Email: {signature.email}</div>}
                {signature.site && <div>Website: {signature.site}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
