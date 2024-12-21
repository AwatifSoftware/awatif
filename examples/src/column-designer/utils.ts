

// Function to get modification factor
export function getKmod(serviceClass: number, loadDurationClass: string): { kMod: number; gamma: number; chi: number } {
    // Define service class, load duration class, and modification factor
    const dfDict: { [key: string]: number[] } = {
        permanent: [0.6, 0.6, 0.5],
        "long-term": [0.7, 0.7, 0.55],
        "medium-term": [0.8, 0.8, 0.65],
        "short-term": [0.9, 0.9, 0.7],
        instantaneous: [1.1, 1.1, 0.9],
    };

    const validServiceClasses = [1, 2, 3];
    const validLoadDurations = Object.keys(dfDict);

    // Validate inputs
    if (!validServiceClasses.includes(serviceClass)) {
        throw new Error(`Invalid service class: ${serviceClass}. Must be one of ${validServiceClasses.join(", ")}.`);
    }
    if (!validLoadDurations.includes(loadDurationClass)) {
        throw new Error(`Invalid load duration class: ${loadDurationClass}. Must be one of ${validLoadDurations.join(", ")}.`);
    }

    // Look up the modification factor
    const kMod = dfDict[loadDurationClass][serviceClass - 1];

    // Calculate gamma and chi
    const gamma = 1.3;
    const chi = kMod / gamma;

    return { kMod, gamma, chi };
}

// Example usage
try {
    const { kMod, gamma, chi } = getKmod(2, "short-term");
    console.log(`kMod: ${kMod}, gamma: ${gamma}, chi: ${chi}`);
} catch (error) {
    console.error(error.message);
}

// Define Glulam properties
export interface Glulam {
    name: string;
    rho_k: number;
    f_mk: number;
    f_t0k: number;
    f_t90k: number;
    f_c0k: number;
    f_c90k: number;
    f_vk: number;
    E0mean: number;
    E05: number;
    G05: number;
}

// Define lists for timber properties
const L_grades: string[] = ["GL20c", "GL22c", "GL24c", "GL26c", "GL28c", "GL30c", "GL32c", "GL20h", "GL22h", "GL24h", "GL26h", "GL28h", "GL30h", "GL32h"];
const L_rhok: number[] = [355, 355, 365, 385, 390, 390, 400, 340, 370, 385, 405, 425, 430, 440];
const L_fmk: number[] = [20, 22, 24, 26, 28, 30, 32, 20, 22, 24, 26, 28, 30, 32];
const L_t0k: number[] = [15, 16, 17, 19, 19.5, 19.5, 19.5, 16, 17.6, 19.2, 20.8, 22.3, 24, 25.6];
const L_t90k: number[] = Array(14).fill(0.5);
const L_fc0k: number[] = [18.5, 20, 21.5, 23.5, 24, 24.5, 24.5, 20, 22, 24, 26, 28, 30, 32];
const L_c90k: number[] = Array(14).fill(2.5);
const L_fvk: number[] = [3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5];
const L_E0mean: number[] = [10400, 10400, 11000, 12000, 12500, 13000, 13500, 8400, 10500, 11500, 12100, 12600, 13600, 14200];
const L_E05: number[] = [8600, 8600, 9100, 10000, 10400, 10800, 11200, 7000, 8800, 9860, 10100, 10500, 11300, 11800];
const L_G05: number[] = Array(14).fill(540);

// Instantiate objects using a loop
const L_glulam_classes: Glulam[] = [];
for (let i = 0; i < L_grades.length; i++) {
    L_glulam_classes.push({
        name: L_grades[i],
        rho_k: L_rhok[i],
        f_mk: L_fmk[i],
        f_t0k: L_t0k[i],
        f_t90k: L_t90k[i],
        f_c0k: L_fc0k[i],
        f_c90k: L_c90k[i],
        f_vk: L_fvk[i],
        E0mean: L_E0mean[i],
        E05: L_E05[i],
        G05: L_G05[i],
    });
}

// Function to get glulam properties
export function getGlulamProperties(grade: string): Glulam | null {
    const timberIndex = L_grades.indexOf(grade);
    if (timberIndex === -1) {
        return null; // Grade not found
    }
    return L_glulam_classes[timberIndex];
}

// Example usage: Retrieve glulam properties for a specific grade
const grade = "GL24h";
const glulam = getGlulamProperties(grade);

if (glulam) {
    console.log(`Glulam Properties for ${grade}:`, glulam);
} else {
    console.error(`Grade "${grade}" not found.`);
}
