import { CountryRegion } from "./pricing";

export const initialPricingData: CountryRegion[] = [
  {
    "code": "US",
    "name": "USA",
    "flag": "🇺🇸",
    "type": "region",
    "items": [
      {
        "name": "Delaware",
        "type": "incorporation",
        "flag": "🇺🇸",
        "pricing": {
          "government_fees": 89,
          "service_fee": 500,
          "registered_agent": 299,
          "total_first_year": 888,
          "annual_renewal": 449,
          "currency": "USD",
          "timeline": "3-5 business days"
        }
      },
      {
        "name": "New York",
        "type": "incorporation",
        "flag": "🇺🇸",
        "pricing": {
          "government_fees": 125,
          "service_fee": 500,
          "registered_agent": 299,
          "total_first_year": 924,
          "annual_renewal": 485,
          "currency": "USD",
          "timeline": "5-7 business days"
        }
      },
      {
        "name": "Wyoming",
        "type": "incorporation",
        "flag": "🇺🇸",
        "pricing": {
          "government_fees": 100,
          "service_fee": 500,
          "registered_agent": 299,
          "total_first_year": 899,
          "annual_renewal": 360,
          "currency": "USD",
          "timeline": "3-5 business days"
        }
      },
      {
        "name": "California",
        "type": "incorporation",
        "flag": "🇺🇸",
        "pricing": {
          "government_fees": 70,
          "service_fee": 500,
          "registered_agent": 299,
          "franchise_tax": 800,
          "total_first_year": 1669,
          "annual_renewal": 1199,
          "currency": "USD",
          "timeline": "5-10 business days"
        }
      },
      {
        "name": "Washington",
        "type": "incorporation",
        "flag": "🇺🇸",
        "pricing": {
          "government_fees": 200,
          "service_fee": 500,
          "registered_agent": 299,
          "total_first_year": 999,
          "annual_renewal": 499,
          "currency": "USD",
          "timeline": "5-7 business days"
        }
      },
      {
        "name": "Washington D.C.",
        "type": "incorporation",
        "flag": "🇺🇸",
        "pricing": {
          "government_fees": 220,
          "service_fee": 500,
          "registered_agent": 299,
          "total_first_year": 1019,
          "annual_renewal": 519,
          "currency": "USD",
          "timeline": "5-7 business days"
        }
      }
    ]
  },
  {
    "code": "GB",
    "name": "UK",
    "flag": "🇬🇧",
    "type": "country",
    "items": [
      {
        "name": "United Kingdom",
        "type": "incorporation",
        "flag": "🇬🇧",
        "pricing": {
          "government_fees": 12,
          "service_fee": 799,
          "registered_office": 299,
          "total_first_year": 1110,
          "annual_renewal": 599,
          "currency": "GBP",
          "timeline": "1-3 business days"
        }
      }
    ]
  },
  {
    "code": "EU",
    "name": "Europe",
    "flag": "🇪🇺",
    "type": "region",
    "items": [
      {
        "name": "Switzerland",
        "type": "incorporation",
        "flag": "🇨🇭",
        "pricing": {
          "government_fees": 600,
          "service_fee": 2500,
          "registered_office": 1200,
          "total_first_year": 4300,
          "annual_renewal": 2400,
          "currency": "CHF",
          "timeline": "10-15 business days"
        }
      },
      {
        "name": "Ireland",
        "type": "incorporation",
        "flag": "🇮🇪",
        "pricing": {
          "government_fees": 100,
          "service_fee": 1500,
          "registered_office": 600,
          "total_first_year": 2200,
          "annual_renewal": 1200,
          "currency": "EUR",
          "timeline": "7-10 business days"
        }
      },
      {
        "name": "Estonia",
        "type": "incorporation",
        "flag": "🇪🇪",
        "pricing": {
          "government_fees": 265,
          "service_fee": 999,
          "registered_office": 400,
          "total_first_year": 1664,
          "annual_renewal": 800,
          "currency": "EUR",
          "timeline": "3-5 business days"
        }
      },
      {
        "name": "Lithuania",
        "type": "incorporation",
        "flag": "🇱🇹",
        "pricing": {
          "government_fees": 180,
          "service_fee": 899,
          "registered_office": 350,
          "total_first_year": 1429,
          "annual_renewal": 750,
          "currency": "EUR",
          "timeline": "5-7 business days"
        }
      },
      {
        "name": "Hungary",
        "type": "incorporation",
        "flag": "🇭🇺",
        "pricing": {
          "government_fees": 150,
          "service_fee": 999,
          "registered_office": 400,
          "total_first_year": 1549,
          "annual_renewal": 800,
          "currency": "EUR",
          "timeline": "5-10 business days"
        }
      },
      {
        "name": "Georgia",
        "type": "incorporation",
        "flag": "🇬🇪",
        "pricing": {
          "government_fees": 50,
          "service_fee": 799,
          "registered_office": 300,
          "total_first_year": 1149,
          "annual_renewal": 600,
          "currency": "USD",
          "timeline": "3-5 business days"
        }
      },
      {
        "name": "Bulgaria",
        "type": "incorporation",
        "flag": "🇧🇬",
        "pricing": {
          "government_fees": 120,
          "service_fee": 899,
          "registered_office": 350,
          "total_first_year": 1369,
          "annual_renewal": 700,
          "currency": "EUR",
          "timeline": "5-7 business days"
        }
      },
      {
        "name": "Czech Republic",
        "type": "incorporation",
        "flag": "🇨🇿",
        "pricing": {
          "government_fees": 200,
          "service_fee": 999,
          "registered_office": 400,
          "total_first_year": 1599,
          "annual_renewal": 800,
          "currency": "EUR",
          "timeline": "7-10 business days"
        }
      },
      {
        "name": "Slovakia",
        "type": "incorporation",
        "flag": "🇸🇰",
        "pricing": {
          "government_fees": 150,
          "service_fee": 899,
          "registered_office": 380,
          "total_first_year": 1429,
          "annual_renewal": 780,
          "currency": "EUR",
          "timeline": "7-10 business days"
        }
      },
      {
        "name": "Romania",
        "type": "incorporation",
        "flag": "🇷🇴",
        "pricing": {
          "government_fees": 100,
          "service_fee": 799,
          "registered_office": 350,
          "total_first_year": 1249,
          "annual_renewal": 700,
          "currency": "EUR",
          "timeline": "5-7 business days"
        }
      },
      {
        "name": "Malta",
        "type": "incorporation",
        "flag": "🇲🇹",
        "pricing": {
          "government_fees": 245,
          "service_fee": 1500,
          "registered_office": 600,
          "total_first_year": 2345,
          "annual_renewal": 1200,
          "currency": "EUR",
          "timeline": "10-15 business days"
        }
      },
      {
        "name": "Malta Company Formation",
        "type": "incorporation",
        "flag": "🇲🇹",
        "pricing": {
          "government_fees": 245,
          "service_fee": 1500,
          "registered_office": 600,
          "total_first_year": 2345,
          "annual_renewal": 1200,
          "currency": "EUR",
          "timeline": "10-15 business days"
        }
      },
      {
        "name": "Malta STO Company Formation",
        "type": "incorporation",
        "flag": "🇲🇹",
        "pricing": {
          "government_fees": 245,
          "service_fee": 3500,
          "registered_office": 600,
          "compliance_fee": 2000,
          "total_first_year": 6345,
          "annual_renewal": 3800,
          "currency": "EUR",
          "timeline": "15-20 business days"
        }
      },
      {
        "name": "Malta STE Company Formation",
        "type": "incorporation",
        "flag": "🇲🇹",
        "pricing": {
          "government_fees": 245,
          "service_fee": 3500,
          "registered_office": 600,
          "compliance_fee": 2000,
          "total_first_year": 6345,
          "annual_renewal": 3800,
          "currency": "EUR",
          "timeline": "15-20 business days"
        }
      }
    ]
  },
  {
    "code": "CA",
    "name": "Canada",
    "flag": "🇨🇦",
    "type": "country",
    "items": [
      {
        "name": "Canada",
        "type": "incorporation",
        "flag": "🇨🇦",
        "pricing": {
          "government_fees": 200,
          "service_fee": 799,
          "registered_office": 399,
          "total_first_year": 1398,
          "annual_renewal": 799,
          "currency": "CAD",
          "timeline": "5-7 business days"
        }
      }
    ]
  },
  {
    "code": "SG",
    "name": "Singapore",
    "flag": "🇸🇬",
    "type": "country",
    "items": [
      {
        "name": "Singapore",
        "type": "incorporation",
        "flag": "🇸🇬",
        "pricing": {
          "government_fees": 315,
          "service_fee": 1200,
          "registered_office": 500,
          "total_first_year": 2015,
          "annual_renewal": 1200,
          "currency": "SGD",
          "timeline": "3-5 business days"
        }
      },
      {
        "name": "Singapore Incorporation Guide",
        "type": "guide",
        "flag": "🇸🇬",
        "pricing": {
          "service_fee": 0,
          "currency": "SGD",
          "notes": "Free consultation guide"
        }
      },
      {
        "name": "Hong Kong vs Singapore",
        "type": "comparison",
        "flag": "🇸🇬",
        "pricing": {
          "service_fee": 0,
          "currency": "SGD",
          "notes": "Free comparison guide"
        }
      },
      {
        "name": "Singapore Visa Application Guide",
        "type": "visa",
        "flag": "🇸🇬",
        "pricing": {
          "government_fees": 225,
          "service_fee": 800,
          "total_first_year": 1025,
          "currency": "SGD",
          "timeline": "8-12 weeks"
        }
      }
    ]
  },
  {
    "code": "AE",
    "name": "UAE",
    "flag": "🇦🇪",
    "type": "country",
    "items": [
      {
        "name": "Dubai IFZA",
        "type": "incorporation",
        "flag": "🇦🇪",
        "pricing": {
          "government_fees": 2500,
          "service_fee": 2000,
          "license_fee": 8500,
          "total_first_year": 13000,
          "annual_renewal": 11000,
          "currency": "USD",
          "timeline": "7-10 business days"
        }
      },
      {
        "name": "Abu Dhabi",
        "type": "incorporation",
        "flag": "🇦🇪",
        "pricing": {
          "government_fees": 3000,
          "service_fee": 2500,
          "license_fee": 9000,
          "total_first_year": 14500,
          "annual_renewal": 12000,
          "currency": "USD",
          "timeline": "10-15 business days"
        }
      },
      {
        "name": "Meydan & Jebel Ali Free Zone",
        "type": "incorporation",
        "flag": "🇦🇪",
        "pricing": {
          "government_fees": 2200,
          "service_fee": 2000,
          "license_fee": 7500,
          "total_first_year": 11700,
          "annual_renewal": 9700,
          "currency": "USD",
          "timeline": "7-10 business days"
        }
      },
      {
        "name": "Ras Al Khaimah",
        "type": "incorporation",
        "flag": "🇦🇪",
        "pricing": {
          "government_fees": 1800,
          "service_fee": 1800,
          "license_fee": 5500,
          "total_first_year": 9100,
          "annual_renewal": 7300,
          "currency": "USD",
          "timeline": "5-7 business days"
        }
      },
      {
        "name": "VARA Licences",
        "type": "license",
        "flag": "🇦🇪",
        "pricing": {
          "government_fees": 15000,
          "service_fee": 5000,
          "compliance_fee": 10000,
          "total_first_year": 30000,
          "annual_renewal": 25000,
          "currency": "USD",
          "timeline": "30-45 business days"
        }
      }
    ]
  },
  {
    "code": "HK",
    "name": "Hong Kong",
    "flag": "🇭🇰",
    "type": "country",
    "items": [
      {
        "name": "Hong Kong Company Formation",
        "type": "incorporation",
        "flag": "🇭🇰",
        "pricing": {
          "government_fees": 1720,
          "service_fee": 800,
          "registered_office": 400,
          "total_first_year": 2920,
          "annual_renewal": 1600,
          "currency": "HKD",
          "timeline": "5-7 business days"
        }
      },
      {
        "name": "Hong Kong Branch Establishment",
        "type": "incorporation",
        "flag": "🇭🇰",
        "pricing": {
          "government_fees": 1720,
          "service_fee": 1200,
          "registered_office": 400,
          "total_first_year": 3320,
          "annual_renewal": 1800,
          "currency": "HKD",
          "timeline": "7-10 business days"
        }
      },
      {
        "name": "Hong Kong Subsidiary vs Singapore Subsidiary",
        "type": "comparison",
        "flag": "🇭🇰",
        "pricing": {
          "service_fee": 0,
          "currency": "HKD",
          "notes": "Free comparison guide"
        }
      },
      {
        "name": "Accounting, Auditing, and Taxation",
        "type": "compliance",
        "flag": "🇭🇰",
        "pricing": {
          "service_fee": 1500,
          "annual_fee": 1500,
          "currency": "HKD",
          "timeline": "Ongoing",
          "notes": "Annual compliance package"
        }
      },
      {
        "name": "HK Trademark Registration",
        "type": "service",
        "flag": "🇭🇰",
        "pricing": {
          "government_fees": 2000,
          "service_fee": 800,
          "total_first_year": 2800,
          "currency": "HKD",
          "timeline": "6-9 months"
        }
      },
      {
        "name": "Fees & Charges",
        "type": "info",
        "flag": "🇭🇰",
        "pricing": {
          "service_fee": 0,
          "currency": "HKD",
          "notes": "Fee schedule information"
        }
      }
    ]
  },
  {
    "code": "JP",
    "name": "Japan",
    "flag": "🇯🇵",
    "type": "country",
    "items": [
      {
        "name": "Japan",
        "type": "incorporation",
        "flag": "🇯🇵",
        "pricing": {
          "government_fees": 150000,
          "service_fee": 200000,
          "registered_office": 50000,
          "total_first_year": 400000,
          "annual_renewal": 200000,
          "currency": "JPY",
          "timeline": "15-20 business days"
        }
      }
    ]
  },
  {
    "code": "TW",
    "name": "Taiwan",
    "flag": "🇹🇼",
    "type": "country",
    "items": [
      {
        "name": "Taiwan",
        "type": "incorporation",
        "flag": "🇹🇼",
        "pricing": {
          "government_fees": 1000,
          "service_fee": 1500,
          "registered_office": 500,
          "total_first_year": 3000,
          "annual_renewal": 1500,
          "currency": "USD",
          "timeline": "10-15 business days"
        }
      }
    ]
  },
  {
    "code": "MN",
    "name": "Mongolia",
    "flag": "🇲🇳",
    "type": "country",
    "items": [
      {
        "name": "Mongolia",
        "type": "incorporation",
        "flag": "🇲🇳",
        "pricing": {
          "government_fees": 300,
          "service_fee": 1200,
          "registered_office": 400,
          "total_first_year": 1900,
          "annual_renewal": 1000,
          "currency": "USD",
          "timeline": "10-15 business days"
        }
      }
    ]
  },
  {
    "code": "CN",
    "name": "China",
    "flag": "🇨🇳",
    "type": "country",
    "items": [
      {
        "name": "Established Hangzhou Liaison Office, China",
        "type": "entity-setup",
        "flag": "🇨🇳",
        "pricing": {
          "government_fees": 500,
          "service_fee": 2500,
          "registered_office": 800,
          "total_first_year": 3800,
          "annual_renewal": 2000,
          "currency": "USD",
          "timeline": "20-30 business days"
        }
      },
      {
        "name": "China (Shenzhen) Import/Export Agency",
        "type": "entity-setup",
        "flag": "🇨🇳",
        "pricing": {
          "government_fees": 800,
          "service_fee": 3000,
          "registered_office": 1000,
          "total_first_year": 4800,
          "annual_renewal": 2500,
          "currency": "USD",
          "timeline": "25-35 business days"
        }
      }
    ]
  },
  {
    "code": "PA",
    "name": "Panama",
    "flag": "🇵🇦",
    "type": "country",
    "items": [
      {
        "name": "Panama Company Incorporation",
        "type": "incorporation",
        "flag": "🇵🇦",
        "pricing": {
          "government_fees": 350,
          "service_fee": 1200,
          "registered_agent": 450,
          "total_first_year": 2000,
          "annual_renewal": 1200,
          "currency": "USD",
          "timeline": "5-7 business days"
        }
      },
      {
        "name": "Panama Private Interest Foundation",
        "type": "foundation",
        "flag": "🇵🇦",
        "pricing": {
          "government_fees": 500,
          "service_fee": 2000,
          "registered_agent": 600,
          "total_first_year": 3100,
          "annual_renewal": 2000,
          "currency": "USD",
          "timeline": "10-15 business days"
        }
      }
    ]
  },
  {
    "code": "TR",
    "name": "Turkey",
    "flag": "🇹🇷",
    "type": "country",
    "items": [
      {
        "name": "Turkey",
        "type": "incorporation",
        "flag": "🇹🇷",
        "pricing": {
          "government_fees": 500,
          "service_fee": 1500,
          "registered_office": 600,
          "total_first_year": 2600,
          "annual_renewal": 1400,
          "currency": "USD",
          "timeline": "10-15 business days"
        }
      }
    ]
  },
  {
    "code": "VG",
    "name": "BVI",
    "flag": "🇻🇬",
    "type": "country",
    "items": [
      {
        "name": "British Virgin Islands",
        "type": "incorporation",
        "flag": "🇻🇬",
        "pricing": {
          "government_fees": 450,
          "service_fee": 1500,
          "registered_agent": 650,
          "total_first_year": 2600,
          "annual_renewal": 1800,
          "currency": "USD",
          "timeline": "3-5 business days"
        }
      }
    ]
  },
  {
    "code": "AU",
    "name": "Australia",
    "flag": "🇦🇺",
    "type": "country",
    "items": [
      {
        "name": "Australia",
        "type": "incorporation",
        "flag": "🇦🇺",
        "pricing": {
          "government_fees": 506,
          "service_fee": 1200,
          "registered_office": 500,
          "total_first_year": 2206,
          "annual_renewal": 1300,
          "currency": "AUD",
          "timeline": "3-5 business days"
        }
      }
    ]
  },
  {
    "code": "SV",
    "name": "El Salvador",
    "flag": "🇸🇻",
    "type": "country",
    "items": [
      {
        "name": "El Salvador",
        "type": "incorporation",
        "flag": "🇸🇻",
        "pricing": {
          "government_fees": 300,
          "service_fee": 1500,
          "registered_office": 400,
          "total_first_year": 2200,
          "annual_renewal": 1200,
          "currency": "USD",
          "timeline": "10-15 business days"
        }
      }
    ]
  },
  {
    "code": "KY",
    "name": "Cayman Islands",
    "flag": "🇰🇾",
    "type": "country",
    "items": [
      {
        "name": "Cayman Islands",
        "type": "incorporation",
        "flag": "🇰🇾",
        "pricing": {
          "government_fees": 850,
          "service_fee": 2500,
          "registered_agent": 1200,
          "total_first_year": 4550,
          "annual_renewal": 3200,
          "currency": "USD",
          "timeline": "5-7 business days"
        }
      }
    ]
  },
  {
    "code": "VC",
    "name": "St. Vincent",
    "flag": "🇻🇨",
    "type": "country",
    "items": [
      {
        "name": "Saint Vincent and the Grenadines",
        "type": "incorporation",
        "flag": "🇻🇨",
        "pricing": {
          "government_fees": 200,
          "service_fee": 999,
          "registered_agent": 450,
          "total_first_year": 1649,
          "annual_renewal": 1100,
          "currency": "USD",
          "timeline": "3-5 business days"
        }
      }
    ]
  },
  {
    "code": "CR",
    "name": "Costa Rica",
    "flag": "🇨🇷",
    "type": "country",
    "items": [
      {
        "name": "Costa Rica",
        "type": "incorporation",
        "flag": "🇨🇷",
        "pricing": {
          "government_fees": 400,
          "service_fee": 1500,
          "registered_agent": 500,
          "total_first_year": 2400,
          "annual_renewal": 1400,
          "currency": "USD",
          "timeline": "10-15 business days"
        }
      }
    ]
  },
  {
    "code": "SC",
    "name": "Seychelles",
    "flag": "🇸🇨",
    "type": "country",
    "items": [
      {
        "name": "Seychelles",
        "type": "incorporation",
        "flag": "🇸🇨",
        "pricing": {
          "government_fees": 150,
          "service_fee": 999,
          "registered_agent": 450,
          "total_first_year": 1599,
          "annual_renewal": 1100,
          "currency": "USD",
          "timeline": "3-5 business days"
        }
      }
    ]
  },
  {
    "code": "PH",
    "name": "Philippines",
    "flag": "🇵🇭",
    "type": "country",
    "items": [
      {
        "name": "Philippines",
        "type": "incorporation",
        "flag": "🇵🇭",
        "pricing": {
          "government_fees": 300,
          "service_fee": 1200,
          "registered_office": 400,
          "total_first_year": 1900,
          "annual_renewal": 1000,
          "currency": "USD",
          "timeline": "15-20 business days"
        }
      }
    ]
  },
  {
    "code": "TH",
    "name": "Thailand",
    "flag": "🇹🇭",
    "type": "country",
    "items": [
      {
        "name": "Thailand",
        "type": "incorporation",
        "flag": "🇹🇭",
        "pricing": {
          "government_fees": 300,
          "service_fee": 1500,
          "registered_office": 500,
          "total_first_year": 2300,
          "annual_renewal": 1300,
          "currency": "USD",
          "timeline": "10-15 business days"
        }
      }
    ]
  },
  {
    "code": "IM",
    "name": "Isle of Man",
    "flag": "🇮🇲",
    "type": "country",
    "items": [
      {
        "name": "Isle of Man",
        "type": "incorporation",
        "flag": "🇮🇲",
        "pricing": {
          "government_fees": 750,
          "service_fee": 2000,
          "registered_agent": 800,
          "total_first_year": 3550,
          "annual_renewal": 2400,
          "currency": "GBP",
          "timeline": "7-10 business days"
        }
      }
    ]
  },
  {
    "code": "IL",
    "name": "Israel",
    "flag": "🇮🇱",
    "type": "country",
    "items": [
      {
        "name": "Israel",
        "type": "incorporation",
        "flag": "🇮🇱",
        "pricing": {
          "government_fees": 500,
          "service_fee": 1800,
          "registered_office": 600,
          "total_first_year": 2900,
          "annual_renewal": 1600,
          "currency": "USD",
          "timeline": "10-15 business days"
        }
      }
    ]
  },
  {
    "code": "KR",
    "name": "South Korea",
    "flag": "🇰🇷",
    "type": "country",
    "items": [
      {
        "name": "South Korea",
        "type": "incorporation",
        "flag": "🇰🇷",
        "pricing": {
          "government_fees": 400,
          "service_fee": 2000,
          "registered_office": 600,
          "total_first_year": 3000,
          "annual_renewal": 1600,
          "currency": "USD",
          "timeline": "15-20 business days"
        }
      }
    ]
  },
  {
    "code": "BZ",
    "name": "Belize",
    "flag": "🇧🇿",
    "type": "country",
    "items": [
      {
        "name": "Belize",
        "type": "incorporation",
        "flag": "🇧🇿",
        "pricing": {
          "government_fees": 200,
          "service_fee": 999,
          "registered_agent": 450,
          "total_first_year": 1649,
          "annual_renewal": 1100,
          "currency": "USD",
          "timeline": "3-5 business days"
        }
      }
    ]
  },
  {
    "code": "VN",
    "name": "Vietnam",
    "flag": "🇻🇳",
    "type": "country",
    "items": [
      {
        "name": "Vietnam",
        "type": "incorporation",
        "flag": "🇻🇳",
        "pricing": {
          "government_fees": 400,
          "service_fee": 1800,
          "registered_office": 600,
          "total_first_year": 2800,
          "annual_renewal": 1500,
          "currency": "USD",
          "timeline": "20-30 business days"
        }
      },
      {
        "name": "Vietnam Manufacturing Corporation",
        "type": "incorporation",
        "flag": "🇻🇳",
        "pricing": {
          "government_fees": 600,
          "service_fee": 2500,
          "registered_office": 800,
          "licensing_fee": 1500,
          "total_first_year": 5400,
          "annual_renewal": 2800,
          "currency": "USD",
          "timeline": "30-45 business days"
        }
      }
    ]
  },
  {
    "code": "CW",
    "name": "Curacao",
    "flag": "🇨🇼",
    "type": "country",
    "items": [
      {
        "name": "Curacao",
        "type": "incorporation",
        "flag": "🇨🇼",
        "pricing": {
          "government_fees": 300,
          "service_fee": 1500,
          "registered_agent": 500,
          "total_first_year": 2300,
          "annual_renewal": 1400,
          "currency": "USD",
          "timeline": "7-10 business days"
        }
      }
    ]
  },
  {
    "code": "KZ",
    "name": "Kazakhstan",
    "flag": "🇰🇿",
    "type": "country",
    "items": [
      {
        "name": "Kazakhstan",
        "type": "incorporation",
        "flag": "🇰🇿",
        "pricing": {
          "government_fees": 350,
          "service_fee": 1500,
          "registered_office": 500,
          "total_first_year": 2350,
          "annual_renewal": 1300,
          "currency": "USD",
          "timeline": "15-20 business days"
        }
      }
    ]
  },
  {
    "code": "WS",
    "name": "Samoa",
    "flag": "🇼🇸",
    "type": "country",
    "items": [
      {
        "name": "Samoa",
        "type": "incorporation",
        "flag": "🇼🇸",
        "pricing": {
          "government_fees": 180,
          "service_fee": 999,
          "registered_agent": 450,
          "total_first_year": 1629,
          "annual_renewal": 1100,
          "currency": "USD",
          "timeline": "5-7 business days"
        }
      }
    ]
  },
  {
    "code": "MCAP",
    "name": "MCAP Service Overrides",
    "flag": "MCAP",
    "type": "region",
    "items": [
      {
        "name": "HK CR Fee",
        "type": "service_override",
        "flag": "HK",
        "countryCode": "HK",
        "serviceId": "cr_fee",
        "pricing": { "amount": 221, "currency": "USD", "notes": "Default MCAP service fee override" }
      },
      {
        "name": "HK BR Fee",
        "type": "service_override",
        "flag": "HK",
        "countryCode": "HK",
        "serviceId": "br_fee",
        "pricing": { "amount": 283, "currency": "USD" }
      },
      {
        "name": "HK Incorporation Service",
        "type": "service_override",
        "flag": "HK",
        "countryCode": "HK",
        "serviceId": "inc_service",
        "pricing": { "amount": 0, "currency": "USD" }
      },
      {
        "name": "HK Secretary Annual",
        "type": "service_override",
        "flag": "HK",
        "countryCode": "HK",
        "serviceId": "sec_annual",
        "pricing": { "amount": 225, "currency": "USD" }
      },
      {
        "name": "HK KYC",
        "type": "service_override",
        "flag": "HK",
        "countryCode": "HK",
        "serviceId": "kyc",
        "pricing": { "amount": 0, "currency": "USD" }
      },
      {
        "name": "HK Registered Office",
        "type": "service_override",
        "flag": "HK",
        "countryCode": "HK",
        "serviceId": "reg_office",
        "pricing": { "amount": 161, "currency": "USD" }
      },
      {
        "name": "HK Bank Arrangement",
        "type": "service_override",
        "flag": "HK",
        "countryCode": "HK",
        "serviceId": "bank_arr",
        "pricing": { "amount": 400, "currency": "USD" }
      },
      {
        "name": "HK Company Kit",
        "type": "service_override",
        "flag": "HK",
        "countryCode": "HK",
        "serviceId": "kit",
        "pricing": { "amount": 70, "currency": "USD" }
      },
      {
        "name": "HK Correspondence Address",
        "type": "service_override",
        "flag": "HK",
        "countryCode": "HK",
        "serviceId": "corr_addr",
        "pricing": { "amount": 65, "currency": "USD" }
      },
      {
        "name": "US Base - Delaware LLC",
        "type": "service_override",
        "flag": "US",
        "countryCode": "US",
        "serviceId": "base",
        "state": "Delaware",
        "entityType": "LLC",
        "pricing": { "amount": 1200, "currency": "USD" }
      },
      {
        "name": "US Base - Delaware Corporation",
        "type": "service_override",
        "flag": "US",
        "countryCode": "US",
        "serviceId": "base",
        "state": "Delaware",
        "entityType": "Corporation",
        "pricing": { "amount": 1200, "currency": "USD" }
      },
      {
        "name": "US Base - New York LLC",
        "type": "service_override",
        "flag": "US",
        "countryCode": "US",
        "serviceId": "base",
        "state": "New York",
        "entityType": "LLC",
        "pricing": { "amount": 1800, "currency": "USD" }
      },
      {
        "name": "US Base - New York Corporation",
        "type": "service_override",
        "flag": "US",
        "countryCode": "US",
        "serviceId": "base",
        "state": "New York",
        "entityType": "Corporation",
        "pricing": { "amount": 2350, "currency": "USD" }
      },
      {
        "name": "US Base - Wyoming LLC",
        "type": "service_override",
        "flag": "US",
        "countryCode": "US",
        "serviceId": "base",
        "state": "Wyoming",
        "entityType": "LLC",
        "pricing": { "amount": 1200, "currency": "USD" }
      },
      {
        "name": "US Base - Wyoming Corporation",
        "type": "service_override",
        "flag": "US",
        "countryCode": "US",
        "serviceId": "base",
        "state": "Wyoming",
        "entityType": "Corporation",
        "pricing": { "amount": 1200, "currency": "USD" }
      },
      {
        "name": "US Base - California LLC",
        "type": "service_override",
        "flag": "US",
        "countryCode": "US",
        "serviceId": "base",
        "state": "California",
        "entityType": "LLC",
        "pricing": { "amount": 1200, "currency": "USD" }
      },
      {
        "name": "US Base - California Corporation",
        "type": "service_override",
        "flag": "US",
        "countryCode": "US",
        "serviceId": "base",
        "state": "California",
        "entityType": "Corporation",
        "pricing": { "amount": 1200, "currency": "USD" }
      },
      {
        "name": "US Base - Washington LLC",
        "type": "service_override",
        "flag": "US",
        "countryCode": "US",
        "serviceId": "base",
        "state": "Washington",
        "entityType": "LLC",
        "pricing": { "amount": 1200, "currency": "USD" }
      },
      {
        "name": "US Base - Washington Corporation",
        "type": "service_override",
        "flag": "US",
        "countryCode": "US",
        "serviceId": "base",
        "state": "Washington",
        "entityType": "Corporation",
        "pricing": { "amount": 1200, "currency": "USD" }
      },
      {
        "name": "US Base - Washington D.C. LLC",
        "type": "service_override",
        "flag": "US",
        "countryCode": "US",
        "serviceId": "base",
        "state": "Washington D.C.",
        "entityType": "LLC",
        "pricing": { "amount": 1200, "currency": "USD" }
      },
      {
        "name": "US Base - Washington D.C. Corporation",
        "type": "service_override",
        "flag": "US",
        "countryCode": "US",
        "serviceId": "base",
        "state": "Washington D.C.",
        "entityType": "Corporation",
        "pricing": { "amount": 1200, "currency": "USD" }
      },
      {
        "name": "US Airwallex",
        "type": "service_override",
        "flag": "US",
        "countryCode": "US",
        "serviceId": "airwallex",
        "pricing": { "amount": 0, "currency": "USD" }
      },
      {
        "name": "US Payoneer",
        "type": "service_override",
        "flag": "US",
        "countryCode": "US",
        "serviceId": "payoneer",
        "pricing": { "amount": 0, "currency": "USD" }
      },
      {
        "name": "SG Company Incorporation",
        "type": "service_override",
        "flag": "SG",
        "countryCode": "SG",
        "serviceId": "companyIncorporation",
        "pricing": { "amount": 350, "currency": "USD" }
      },
      {
        "name": "SG Company Secretary",
        "type": "service_override",
        "flag": "SG",
        "countryCode": "SG",
        "serviceId": "companySecretary",
        "pricing": { "amount": 480, "currency": "USD" }
      },
      {
        "name": "SG Registered Address",
        "type": "service_override",
        "flag": "SG",
        "countryCode": "SG",
        "serviceId": "registeredAddress",
        "pricing": { "amount": 300, "currency": "USD" }
      },
      {
        "name": "SG Nominee Director",
        "type": "service_override",
        "flag": "SG",
        "countryCode": "SG",
        "serviceId": "nomineeDirector",
        "pricing": { "amount": 2000, "currency": "USD" }
      },
      {
        "name": "SG Nominee Security",
        "type": "service_override",
        "flag": "SG",
        "countryCode": "SG",
        "serviceId": "nomineeSecurity",
        "pricing": { "amount": 2000, "currency": "USD" }
      },
      {
        "name": "SG Bank Account Advisory",
        "type": "service_override",
        "flag": "SG",
        "countryCode": "SG",
        "serviceId": "bankAccountAdvisory",
        "pricing": { "amount": 1200, "currency": "USD" }
      },
      {
        "name": "SG EMI E-Account",
        "type": "service_override",
        "flag": "SG",
        "countryCode": "SG",
        "serviceId": "emiEAccount",
        "pricing": { "amount": 0, "currency": "USD" }
      }
    ]
  }
];
