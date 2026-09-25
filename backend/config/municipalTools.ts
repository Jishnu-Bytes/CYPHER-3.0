import { Type } from "@google/genai";

/**
 * Gemini Function Declaration for lookup_municipal_department tool call
 */
export const lookupMunicipalDepartmentDeclaration = {
  name: "lookup_municipal_department",
  description: "Queries the municipal sovereign infrastructure registry to match civic hazards with their authorized response agency, specialized crew certifications, and mandatory safety isolation checklists.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      hazard_category: {
        type: Type.STRING,
        description: "The primary hazard classification (e.g., Electrical, Structural, Water_Sewer, Fire, Road Hazard, Disaster).",
      },
      criticality_level: {
        type: Type.INTEGER,
        description: "Criticality score (1=Minor, 2=Maintenance, 3=Moderate, 4=Severe Emergency, 5=Life-Safety Crisis).",
      },
      location: {
        type: Type.STRING,
        description: "Geographic municipal district or urban sector (e.g., Hyderabad, Hitec City, Secunderabad, São Paulo, Johannesburg).",
      },
    },
    required: ["hazard_category", "criticality_level", "location"],
  },
};

export interface MunicipalDepartmentMatch {
  department: string;
  recommended_crew: string;
  required_equipment: string[];
  safety_isolation_protocol: string;
  target_sla_minutes: number;
}

/**
 * Executes department lookup dynamically
 */
export function lookupMunicipalDepartment(
  hazard_category: string,
  criticality_level: number,
  location: string
): MunicipalDepartmentMatch {
  const cat = (hazard_category || "").toLowerCase();
  const loc = (location || "").toLowerCase();
  const isIndia = loc.includes("hyderabad") || loc.includes("bengaluru") || loc.includes("mumbai") || loc.includes("delhi") || loc.includes("india") || loc.includes("secunderabad") || loc.includes("uppal");
  const isBrazil = loc.includes("são paulo") || loc.includes("rio") || loc.includes("brazil");
  const isSouthAfrica = loc.includes("johannesburg") || loc.includes("cape town") || loc.includes("south");

  // 1. Electrical / Power Grid
  if (cat.includes("electr") || cat.includes("power") || cat.includes("wire") || cat.includes("transformer")) {
    return {
      department: isIndia 
        ? "TSSPDCL Electrical Safety & Emergency Isolation Division" 
        : isBrazil 
        ? "Enel Distribuição São Paulo Divisão de Emergência Elétrica" 
        : "City Power Johannesburg High-Voltage Rapid Unit",
      recommended_crew: criticality_level >= 4 
        ? "High-Voltage Emergency Response Team" 
        : "High-Voltage Line Squad 02",
      required_equipment: [
        "Insulated Bucket Truck",
        "High-Voltage Voltage Detector",
        "Phase-to-Ground Clamps",
        "Arc-Flash Level 4 Safety Suits"
      ],
      safety_isolation_protocol: "Remote substation feeder trip (Feeder 4B) verified; test for capacitive residual charge before grounding.",
      target_sla_minutes: criticality_level === 5 ? 15 : 60
    };
  }

  // 2. Water / Sewer / Inundation
  if (cat.includes("water") || cat.includes("sewer") || cat.includes("drain") || cat.includes("culvert") || cat.includes("pipe") || cat.includes("flood")) {
    return {
      department: isIndia 
        ? "HMWSSB (Hyderabad Metropolitan Water Supply & Sewerage Board) & GHMC Disaster Management" 
        : isBrazil 
        ? "SABESP Emergência Hidráulica & Defesa Civil" 
        : "Johannesburg Water Rapid Infrastructure Maintenance",
      recommended_crew: criticality_level >= 4 
        ? "Rapid Inundation & High-Pressure Pipeline Isolation Unit" 
        : "Utility Crew 04",
      required_equipment: [
        "High-Pressure Pipe Clamp Kit",
        "Hydraulic Trench Shoring",
        "Industrial Dewatering Pump",
        "Spillway Sandbag Barriers"
      ],
      safety_isolation_protocol: "Upstream trunk sluice valve lockdown; de-watering and hydrostatic pressure venting before trench entry.",
      target_sla_minutes: criticality_level === 5 ? 15 : 120
    };
  }

  // 3. Structural / Roads / Bridges
  if (cat.includes("road") || cat.includes("structur") || cat.includes("bridge") || cat.includes("flyover") || cat.includes("pothole") || cat.includes("crater")) {
    return {
      department: isIndia 
        ? "GHMC Directorate of Town Planning & Highway Infrastructure" 
        : isBrazil 
        ? "CET São Paulo & Secretaria Municipal de Infraestrutura" 
        : "JRA (Johannesburg Roads Agency) Structural Emergency Cell",
      recommended_crew: criticality_level >= 4 
        ? "Heavy Engineering & Roadway Shoring Taskforce" 
        : "Rapid Highway Sweeper Unit 01",
      required_equipment: [
        "Heavy Hydraulic Excavator",
        "Traffic Diverter Cones",
        "Pavement Milling Rig",
        "Structural Load Sensors"
      ],
      safety_isolation_protocol: "Immediate perimeter lane closure; diversion signage deployed at 100m upstream; verify load bearing.",
      target_sla_minutes: criticality_level >= 4 ? 60 : 720
    };
  }

  // 4. Default Emergency Taskforce
  return {
    department: "Municipal Civil Defense & Disaster Management Directorate",
    recommended_crew: "Rapid Multi-Disciplinary Response Corps 01",
    required_equipment: [
      "Tactical Mobile Command Unit",
      "Perimeter Danger Tape",
      "Emergency Generator Bank"
    ],
    safety_isolation_protocol: "Establish 50-meter perimeter cordon; deploy public safety warnings and notify emergency switchboard.",
    target_sla_minutes: 30
  };
}
