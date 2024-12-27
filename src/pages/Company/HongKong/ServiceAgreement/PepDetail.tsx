import { Card } from "@/components/ui/card";

const PenDetail = () => {
    const pepDefinitions = [
        {
            title: "Foreign PEPs",
            description: "Individuals who are or have been entrusted with prominent public functions by a foreign country, for example Heads of State or of government, senior politicians, senior government, judicial or military officials, senior executives of state owned corporations, important political party officials.",
            korean: "외국의 정치적 주요인물은 과거 또는 고기에 외국에서 정치적/사회적으로 중요한 역할을 가진 자를 뜻합니다. 예를 들어, 외국 정부의 원수, 사법, 국방, 기타 정부기관의 고위관리자, 주요 외국 정당의 고위관리자, 외국 국영기업의 경영자 등을 뜻함."
        },
        {
            title: "Domestic PEPs",
            description: "Individuals who are or have been entrusted domestically with prominent public functions, for example Heads of State or of government, senior politicians, senior government, judicial or military officials, senior executives of state owned corporations, important political party officials.",
            korean: "국내의 정치적 주요인물은 현재 또는 과거에 국내에서 정치적/사회적으로 중요한 역할을 가진 자를 뜻합니다. 예를 들어, 국내 정부의 원수, 사법, 국방, 기타 정부기관의 고위관리자, 주요 국내 정당의 고위관리자, 외국 국영기업의 경영자 등을 뜻합니다."
        },
        {
            title: "International organisation PEPs",
            description: "Persons who are or have been entrusted with a prominent function by an international organisation, refers to members of senior management or individuals who have been entrusted with equivalent functions, i.e. directors, deputy directors and members of the board or equivalent functions.",
            korean: "국제 단체 정치적 주요인물이란, 국제 단체로 영향을 가진 자로, 예를 들어 이사, 사무관 혹은 이사회 구성원, 고위 경영진 혹은 그와 대등한 기능 지닌 자 등을 뜻합니다."
        },
        {
            title: "Family members",
            description: "Family members are individuals who are related to a PEP either directly (consanguinity) or through marriage or similar (civil) forms of partnership.",
            korean: "가족은 정치적 주요인물의 부모, 형제, 배우자, 자녀, 혈연 또는 결혼적 의한 친인척을 뜻합니다."
        },
        {
            title: "Close associates",
            description: "Close associates are individuals who are closely connected to a PEP, either socially or professionally.",
            korean: "밀접한 관계가 있는 자는, 정치적 주요인물과 사회적으로 혹은 업무적으로 밀접한 관계를 지닌 자를 뜻합니다."
        }
    ];

    const fatfOffences = [
        {
            title: "participation in an organised criminal group and racketeering",
            korean: "범죄 조직 이나 공갈협박에 가담한 죄이 있거나 ;"
        },
        {
            title: "terrorism, including terrorist financing",
            korean: "테러리스트 자금 조달을 포함한 테러리즘 행동에 가담한 죄이 있거나 ;"
        },
        {
            title: "trafficking in human beings and migrant smuggling",
            korean: "사람 및 이민자 밀입국 활동이나 ;"
        },
        {
            title: "sexual exploitation, including sexual exploitation of children",
            korean: "아동 성범죄를 포함한 성범죄 행위나 ;"
        },
        {
            title: "illicit trafficking in narcotic drugs and psychotropic substances; illicit arms trafficking",
            korean: "마약 및 향정신성물질 밀매 행위나 ; 무기 밀매 ;"
        },
        {
            title: "illicit trafficking in stolen and other goods",
            korean: "절도 및 기타 상품 불법 거래 ;"
        },
        {
            title: "corruption and bribery; fraud; counterfeiting currency; counterfeiting and piracy of products",
            korean: "부패, 뇌물 ; 사기 ; 화폐 위조 ; 상품 불법 복제 ;"
        },
        {
            title: "environmental crime",
            korean: "환경 범죄 ;"
        },
        {
            title: "murder, grievous bodily injury; kidnapping, illegal restraint and hostage-taking",
            korean: "살인, 극심한 신체 구타 및 상해 행위 ; 유괴 및 불법 감금, 인질 범죄 ;"
        },
        {
            title: "robbery or theft; smuggling; (including in relation to customs and excise duties and taxes)",
            korean: "강도 및 절도 ; 관세 및 세금 등 탈세 ;"
        },
        {
            title: "tax crimes (related to direct taxes and indirect taxes)",
            korean: "직접세 및 간접세과 관련한 세금 범죄 ;"
        },
        {
            title: "extortion; forgery; piracy; and insider trading and market manipulation",
            korean: "강요 및 갈취 ; 위조 ; 도용 ; 그리고 내부거래와 시장 조작 행위에 가담"
        }
    ];

    return (
        <Card className="w-full max-w-[800px] mx-auto p-6 print:p-0 rounded-none">
            <h1 className="text-xl font-bold mb-6">Appendix 부록</h1>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    1. Politically Exposed Person (정치적 주요인물)
                    <span className="text-gray-600 italic">
                        (Source : FATF Guidance: Politically Exposed Persons (Rec.12 and 22))
                    </span>
                </h2>

                <div className="space-y-6">
                    {pepDefinitions.map((pep, index) => (
                        <div key={index} className="space-y-2">
                            <h3 className="font-semibold">• {pep.title}</h3>
                            <p className="text-sm text-gray-800 leading-relaxed">{pep.description}</p>
                            <p className="text-sm text-gray-800 leading-relaxed">{pep.korean}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-4">
                    2. Designated categories of offences FATF에 명시된 위법 카테고리
                    <span className="text-gray-600 italic">
                        (Source : Glossary of the FATF Recommendations)
                    </span>
                </h2>

                <div className="space-y-4">
                    {fatfOffences.map((offence, index) => (
                        <div key={index} className="space-y-1">
                            <p className="text-sm text-gray-800">• {offence.title}</p>
                            <p className="text-sm text-gray-800">{offence.korean}</p>
                        </div>
                    ))}
                </div>
            </section>
        </Card>
    );
};

export default PenDetail;