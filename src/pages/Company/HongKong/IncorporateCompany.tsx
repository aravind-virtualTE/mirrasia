import React, { useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const IncorporateCompany = () => {
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const createEditablePDF = async () => {
    // Step 1: Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();
  
    // Step 2: Embed fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
    // Step 3: Add the first page
    const firstPage = pdfDoc.addPage([595.28, 841.89]); // A4 size dimensions
    firstPage.drawText("Company Secretary and Registered Address", {
      x: 80,
      y: 750,
      size: 22,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
  
    firstPage.drawText("Service Agreement", {
      x: 220,
      y: 720,
      size: 21,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
  
    // Yellow highlight and text
    firstPage.drawRectangle({
      x: 145,
      y: 590,
      width: 200,
      height: 23,
      color: rgb(1, 1, 0), // Yellow background
    });
    firstPage.drawText("TRUSTPAY AI SYSTEMS LIMITED", {
      x: 150,
      y: 600,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
  
    firstPage.drawText("and", {
      x: 280,
      y: 450,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText("MIRR ASIA BUSINESS ADVISORY &", {
      x: 160,
      y: 240,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText("SECRETARIAL COMPANY LIMITED", {
      x: 180,
      y: 220,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
  
    // Border for the first page
    firstPage.drawRectangle({
      x: 20,
      y: 20,
      width: firstPage.getWidth() - 40,
      height: firstPage.getHeight() - 40,
      borderColor: rgb(0, 0, 0),
      borderWidth: 2,
    });
  
 
    const form = pdfDoc.getForm();
  
    const dateField = form.createTextField("datedOn");
    dateField.setText("Enter Date...");
    dateField.addToPage(firstPage, { x: 150, y: 140, width: 200, height: 20 });
  
    firstPage.drawText("Dated on:", {
      x: 95,
      y: 145,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
  
    const refField = form.createTextField("refNo");
    refField.setText("HK-A241004016");
    refField.addToPage(firstPage, { x: 150, y: 100, width: 200, height: 20 });
  
    firstPage.drawText("Ref. no:", {
      x: 100,
      y: 105,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
  
  //second page
    const secondPage = pdfDoc.addPage([595.28, 841.89]); // A4 size dimensions
  
 
    secondPage.drawText(
      "This Agreement (“Agreement”) is made this  ",
      { x: 50, y: 800, size: 12, font, color: rgb(0, 0, 0) }
    );
    const emptyspace = form.createTextField("empty");
    emptyspace.addToPage(secondPage, { x: 290, y: 795, width: 160, height: 15 });
  
    secondPage.drawText(
        " by and between",
        { x: 460, y: 800, size: 12, font, color: rgb(0, 0, 0) }
      );
 
    secondPage.drawRectangle({
      x: 650,
      y: 800,
      width: 200,
      height: 20,
      color: rgb(1, 1, 0),
    });
  

    secondPage.drawText(
        " by and between",
        { x: 460, y: 800, size: 12, font, color: rgb(0, 0, 0) }
      );
      const locatedIn = form.createTextField(" ");
      locatedIn.addToPage(secondPage, { x: 50, y: 775, width: 420, height: 15 });
    
    secondPage.drawText("located in", {
      x: 500,
      y: 780,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
  
    secondPage.drawText(
      "WORKSHOP UNIT B50, 2/F, KWAI SHING IND. BLDG., PHASE 1, 36-40 TAI LIN PAI RD, KWAI ",
      { x: 50, y: 760, size: 12, font, color: rgb(0, 0, 0) }
    );
  
    secondPage.drawText(
      "CHUNG, N.T., HONG KONG (“Client”) and MIRR ASIA BUSINESS ADVISORY & SECRETARIAL",
      { x: 50, y: 740, size: 12, font, color: rgb(0, 0, 0) }
    );
  
    secondPage.drawText(
      "COMPANY LIMITED located in WORKSHOP UNIT B50 & B58, 2/F, KWAI SHING IND. BLDG.,",
      { x: 50, y: 720, size: 12, font, color: rgb(0, 0, 0) }
    );
  
    secondPage.drawText(
      "PHASE 1, 36-40 TAI LIN PAI RD, KWAI CHUNG, N.T., HONG KONG (“Secretary”) for Client’s",
      { x: 50, y: 700, size: 12, font, color: rgb(0, 0, 0) }
    );
  
    secondPage.drawText(
      "secretarial and registered office services (“Services”).",
      { x: 50, y: 680, size: 12, font, color: rgb(0, 0, 0) }
    );
  
    // Add second highlight
    // secondPage.drawRectangle({
    //   x: 50,
    //   y: 640,
    //   width: 250,
    //   height: 20,
    //   color: rgb(1, 1, 0),
    // });
    secondPage.drawText(
        "This Agreement between",
        { x: 50, y: 650, size: 12, font, color: rgb(0, 0, 0) }
      );
      const aggremntComp = form.createTextField("_")
      aggremntComp.addToPage(secondPage, { x: 200, y: 648, width: 300, height: 15 });
  
    // secondPage.drawText("TRUSTPAY AI SYSTEMS LIMITED", {
    //   x: 55,
    //   y: 645,
    //   size: 12,
    //   font: boldFont,
    //   color: rgb(0, 0, 0),
    // });
  // Draw the text
// Draw the text
secondPage.drawText("and MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED", {
    x: 50,
    y: 630,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
 
  secondPage.drawLine({
    start: { x: 50, y: 628 }, // Slightly below the text
    end: { x: 400, y: 628 }, // Adjust the end X value to match text width
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  
  
  
    secondPage.drawText(
      "consists of the following terms and conditions, all exhibits and attachments hereto,",
      { x: 50, y: 610, size: 12, font, color: rgb(0, 0, 0) }
    );
  
    secondPage.drawText(
      "and any written modifications to this Agreement.",
      { x: 50, y: 590, size: 12, font, color: rgb(0, 0, 0) }
    );
     
 
let currentY = 560;  


secondPage.drawText("1       Purpose of Service Agreement", {
  x: 50,
  y: currentY,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});

currentY -= 30; // Adjust line spacing
secondPage.drawText(
  "The purpose of this agreement is to prevent any misunderstandings or disputes that ",
  { x:78 , y: currentY, size: 12, font, color: rgb(0, 0, 0) }
);

currentY -= 20;
secondPage.drawText(
  " may arise in relation to the scope of Services provided by Secretary and its limitations to Client.",
  { x: 78, y: currentY, size: 12, font, color: rgb(0, 0, 0) }
);

// Section 2
currentY -= 40;
secondPage.drawText("2       Role of Hong Kong Company Secretary and Limitation of Liability", {
  x: 50,
  y: currentY,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});
// Section 2.1
currentY -= 20; // Space before section 2.1
secondPage.drawText(
  "2.1    We (Secretary) will be registered as a secretary in Client’s files in accordance ",
  { x: 50, y: currentY, size: 12, font, color: rgb(0, 0, 0) }
);

currentY -= 15; // Line spacing
secondPage.drawText(
  " with the Hong Kong Companies Ordinance (Cap 622) and the Articles of Association of Client, and ",
  { x: 50, y: currentY, size: 12, font, color: rgb(0, 0, 0) }
);

currentY -= 15; // Line spacing
secondPage.drawText(
  " it means that we will act as Client’s secretary and also provide Client’s registered office address ",
  { x: 50, y: currentY, size: 12, font, color: rgb(0, 0, 0) }
);

currentY -= 15; // Line spacing
secondPage.drawText(
  " for the agreed period between both parties, and if Client renews our annual secretarial and ",
  { x: 50, y: currentY, size: 12, font, color: rgb(0, 0, 0) }
);

currentY -= 15; // Line spacing
secondPage.drawText(
  " registered office address services, it will be automatically extended for one year.",
  { x: 50, y: currentY, size: 12, font, color: rgb(0, 0, 0) }
);

// Section 3 Title
currentY -= 30; // Extra spacing before section 3
secondPage.drawText(
  "3 Providing registered address and its limitations of liability",
  { x: 50, y: currentY, size: 12, font, color: rgb(0, 0, 0) }
);


currentY -= 20;
secondPage.drawText(
  "3.1 The address registered in Client shall be the registered address in Hong Kong provided by",
  { x: 50, y: currentY, size: 12, font, color: rgb(0, 0, 0) }
);

currentY -= 15;
secondPage.drawText(
  "Secretary. If Client wishes to change the registered address to another address, Client shall notify",
  { x: 50, y: currentY, size: 12, font, color: rgb(0, 0, 0) }
);

currentY -= 15;
secondPage.drawText(
  "Secretary in writing or by e-mail.",
  { x: 50, y: currentY, size: 12, font, color: rgb(0, 0, 0) }
);

currentY -= 20;
secondPage.drawText(
  "3.2 The address which Secretary provides will be Client’s registered address, however this does not",
  { x: 50, y: currentY, size: 12, font, color: rgb(0, 0, 0) }
);

currentY -= 15;
secondPage.drawText(
  "mean that Secretary will provide Client’s business or physical space.",
  { x: 50, y: currentY, size: 12, font, color: rgb(0, 0, 0) }
);
currentY -= 10;
// Section 3.3
currentY -= 40; // Extra spacing before this subsection
secondPage.drawText("3.3 Client must not use the registered address provided by Secretary for abuse or illegal use, ", {
  x: 50,
  y: currentY,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});

currentY -= 15;
secondPage.drawText("nor disguised as Client’s real business area.", {
  x: 50,
  y: currentY,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});

// Section 3.4
currentY -= 30; // Extra spacing before this subsection
secondPage.drawText("3.4 Client’s incoming mails will be opened and scanned by Secretary according to the letter of", {
  x: 50,
  y: currentY,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});

currentY -= 15;
secondPage.drawText(" consent during the service period and the scanned files will be emailed to Client. If Client", {
  x: 50,
  y: currentY,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});

currentY -= 15;
secondPage.drawText("  wishes to terminate the service, Client shall notify Secretary in writing or by email in advance.  ", {
  x: 50,
  y: currentY,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});

currentY -= 15;
secondPage.drawText("If Client has more than two directors,  at least two directors according to the quorum", {
  x: 50,
  y: currentY,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});

currentY -= 15;
secondPage.drawText(" in the Articles of Associations shall sign in all relevant documents.", {
  x: 50,
  y: currentY,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});

 

// Section 3.5
currentY -= 30; // Extra spacing before this subsection
secondPage.drawText("3.5 Client shall not send or request third parties to send parcels and goods to the Client’s registered  ", {
  x: 50,
  y: currentY,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});

currentY -= 15;
secondPage.drawText(" address provided by Secretary without prior consent.Delivery of parcels or  goods which are not ", {
  x: 50,
  y: currentY,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});

currentY -= 15;
secondPage.drawText("agreed by Secretary in advance", {
  x: 50,
  y: currentY,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});

currentY -= 15;
secondPage.drawText("will not be accepted and will be returned to the sender.", {
  x: 50,
  y: currentY,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});

secondPage.drawText("",{})
    // Add the third page
const thirdPage = pdfDoc.addPage([595.28, 841.89]); // A4 size dimensions

// Title: Scope of Services
thirdPage.drawText("4       Scope of Services", {
  x: 50,
  y: 800, // Fixed y position
  size: 12,
  font: boldFont,
  color: rgb(0, 0, 0),
});

// Subtitle with yellow highlights
thirdPage.drawText("Secretary shall provide following services from                                          to ", {
  x: 50,
  y: 770, // Fixed y position
  size: 12,
  font,
  color: rgb(0, 0, 0),
});
const service_1 = form.createTextField("service1")
service_1.addToPage(thirdPage,{ x:305,y:765,width:120,height:15})

const service_2 = form.createTextField("service2")
service_2.addToPage(thirdPage,{ x:455,y:765,width:120,height:15})
 

// Services list
thirdPage.drawText("a) Company Secretary Registration", { x: 50, y: 750, size: 12, font, color: rgb(0, 0, 0) });
thirdPage.drawText("b) Maintaining statutory records of the company including minutes of meetings, documents", {
  x: 50,
  y: 710,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});
thirdPage.drawText("c) Providing HK address and mailing service including scanning and emailing", {
  x: 50,
  y: 690,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});
thirdPage.drawText("d) Handling Employer's Return for first 2 employees (subject to HKD300 postal charge)", {
  x: 50,
  y: 670,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});
thirdPage.drawText("e) Handling mandatory Survey of Company Information", {
  x: 50,
  y: 650,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});
thirdPage.drawText(
  "f) Preparation of Annual Return form and maintaining the copy of the Renewal form after signing",
  { x: 50, y: 630, size: 12, font, color: rgb(0, 0, 0) }
);
thirdPage.drawText(
  "   by a director and being registered in the Client's Companies Registry",
  { x: 50, y: 615, size: 12, font, color: rgb(0, 0, 0) }
);
thirdPage.drawText("g) Filing and maintaining Significant Controllers Register", {
  x: 50,
  y: 590,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});
thirdPage.drawText("h) Filing and maintaining Register of Members/Directors/Secretary and Organisation Chart", {
  x: 50,
  y: 570,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});
thirdPage.drawText("i) Filing and maintaining Minutes of Annual General Meeting (AGM)", {
  x: 50,
  y: 550,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});
thirdPage.drawText("j) Maintaining the Business Registration Certificate at the registered office", {
  x: 50,
  y: 530,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});
thirdPage.drawText("k) Brief business and operational advice", {
  x: 50,
  y: 510,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});
// Add a new page or continue on the existing page
// const thirdPage = pdfDoc.addPage([595.28, 841.89]); // A4 size dimensions

// Section 4.1
thirdPage.drawText("4.1 Client shall cooperate with Secretary in good faith and shall provide all necessary information", {
  x: 50,
  y: 490,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});
thirdPage.drawText(
  "and documents which Secretary requires and assumes as important in respect of Services. Client shall",
  { x: 50, y: 470, size: 12, font, color: rgb(0, 0, 0) }
);
thirdPage.drawText(
  "not require Secretary for any matters which are unlawful, and Secretary is not obliged to help or",
  { x: 50, y: 450, size: 12, font, color: rgb(0, 0, 0) }
);
thirdPage.drawText("advise upon unlawful matters in respect of Services.", {
  x: 50,
  y: 430,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});

// Section 4.2
thirdPage.drawText("4.2 The brief business and operational advice services provided by Secretary are to the extent which", {
  x: 50,
  y: 410,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});
thirdPage.drawText(
  "Secretary can provide for Client’s business convenience, however Secretary does not have the legal",
  { x: 50, y: 390, size: 12, font, color: rgb(0, 0, 0) }
);
thirdPage.drawText(
  "responsibility for advice services, and Client may not contractually or legally require Secretary in",
  { x: 50, y: 370, size: 12, font, color: rgb(0, 0, 0) }
);
thirdPage.drawText("respect of the advice services.", {
  x: 50,
  y: 350,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});

// Section 5: Service Fee
thirdPage.drawText("5       Service Fee", {
  x: 50,
  y: 330,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});
thirdPage.drawText(
  "For the performance of Services, Secretary shall be paid the amount stated in the attached invoice",
  { x: 50, y: 310, size: 12, font, color: rgb(0, 0, 0) }
);
thirdPage.drawText(
  "upon signing this agreement. The Service fee does not include accounting fee, auditing fee, taxation",
  { x: 50, y: 290, size: 12, font, color: rgb(0, 0, 0) }
);
thirdPage.drawText(
  "fee, bank arrangement fee, bank charge, government fee, tax, courier charge and other third parties",
  { x: 50, y: 270, size: 12, font, color: rgb(0, 0, 0) }
);
thirdPage.drawText("charge.", {
  x: 50,
  y: 250,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});

// Section 6: Assignment and Subcontractors
thirdPage.drawText("6       Assignment and Subcontractors", {
  x: 50,
  y: 230,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});
thirdPage.drawText(
  "Neither Client nor Secretary shall assign or otherwise transfer its rights, duties, and obligations",
  { x: 50, y: 210, size: 12, font, color: rgb(0, 0, 0) }
);
thirdPage.drawText(
  "under this Agreement without the prior written consent of the other.",
  { x: 50, y: 190, size: 12, font, color: rgb(0, 0, 0) }
);

// Section 7: Confidentiality
thirdPage.drawText("7       Confidentiality", {
  x: 50,
  y: 170,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});
thirdPage.drawText(
  "Both parties shall hold confidential all business or technical information obtained from the other or",
  { x: 50, y: 150, size: 12, font, color: rgb(0, 0, 0) }
);
thirdPage.drawText(
  "its affiliates under this Agreement after obtaining such information. The parties’ obligations",
  { x: 50, y: 130, size: 12, font, color: rgb(0, 0, 0) }
);
thirdPage.drawText(
  "hereunder shall not apply to information in the public domain or information lawfully on a non-",
  { x: 50, y: 110, size: 12, font, color: rgb(0, 0, 0) }
);
thirdPage.drawText("confidential basis from others.", {
  x: 50,
  y: 90,
  size: 12,
  font,
  color: rgb(0, 0, 0),
});
// thirdPage.drawText("8      Integration",{
//     x:50,
//     y:70,
//     size:12,
//     font,
//     color: rgb(0, 0, 0),
// });
// thirdPage.drawText("This Agreement is the final and complete understanding of Client and Secretary. This Agreement",{
//     x:50,
//     y:50,
//     size:12,
//     font,
//     color: rgb(0, 0, 0),
// });
// thirdPage.drawText("supersedes all prior or contemporaneous communications, whether oral or written, concerning the",{
//     x:50,
//     y:50,
//     size:12,
//     font,
//     color: rgb(0, 0, 0),
// });
// thirdPage.drawText("subject matter of this Agreement. This Agreement shall take precedence over any preprinted terms",{
//     x:50,
//     y:50,
//     size:12,
//     font,
//     color: rgb(0, 0, 0),
// });
// thirdPage.drawText("and conditions contained in any purchase order or other written communication between the parties",{
//     x:50,
//     y:50,
//     size:12,
//     font,
//     color: rgb(0, 0, 0),
// });


    // Step 5: Save and generate PDF URL
    const pdfBytes = await pdfDoc.save();
    const pdfDataUrl = URL.createObjectURL(new Blob([pdfBytes], { type: "application/pdf" }));
    setPdfDataUrl(pdfDataUrl);
  };
  

  // Generate the PDF when the component is mounted
  React.useEffect(() => {
    createEditablePDF();
  }, []);

  return (
    <div>
      {pdfDataUrl ? (
        <iframe
          src={pdfDataUrl}
          title="Editable PDF"
          width="100%"
          height="600px"
          style={{ border: "none" }}
        ></iframe>
      ) : (
        <p>Loading PDF...</p>
      )}
    </div>
  );
};

export default IncorporateCompany;
 