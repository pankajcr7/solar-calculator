/**
 * Solar Calculator API - Complete Implementation
 * Updated with all Indian States and Union Territories
 */

class SolarCalculator {
    constructor(config = {}) {
        this.config = {
            // Solar irradiation data for all Indian states (kWh/kWp/day)
            solarIrradiation: config.solarIrradiation || {
                // States
                'Andhra Pradesh': 5.3,
                'Arunachal Pradesh': 4.2,
                'Assam': 4.3,
                'Bihar': 4.8,
                'Chhattisgarh': 5.2,
                'Goa': 5.0,
                'Gujarat': 5.5,
                'Haryana': 5.2,
                'Himachal Pradesh': 5.0,
                'Jharkhand': 4.9,
                'Karnataka': 5.3,
                'Kerala': 4.8,
                'Madhya Pradesh': 5.4,
                'Maharashtra': 5.2,
                'Manipur': 4.3,
                'Meghalaya': 4.1,
                'Mizoram': 4.2,
                'Nagaland': 4.2,
                'Odisha': 5.0,
                'Punjab': 5.3,
                'Rajasthan': 5.7,
                'Sikkim': 4.5,
                'Tamil Nadu': 5.2,
                'Telangana': 5.3,
                'Tripura': 4.3,
                'Uttar Pradesh': 4.9,
                'Uttarakhand': 5.1,
                'West Bengal': 4.6,

                // Union Territories
                'Andaman and Nicobar Islands': 4.8,
                'Chandigarh': 5.2,
                'Dadra and Nagar Haveli and Daman and Diu': 5.3,
                'Delhi': 5.1,
                'Jammu and Kashmir': 5.4,
                'Ladakh': 5.8,
                'Lakshadweep': 5.0,
                'Puducherry': 5.1,

                'default': 5.0
            },

            // System specifications
            panelEfficiency: config.panelEfficiency || 0.19, // 19% efficiency
            systemDegradation: config.systemDegradation || 0.005, // 0.5% per year
            performanceRatio: config.performanceRatio || 0.80, // 80% PR

            // Cost parameters (INR)
            costPerKW: config.costPerKW || 50000, // ₹50,000 per kW
            inverterCostPerKW: config.inverterCostPerKW || 8000, // ₹8,000 per kW
            omCostPerKW: config.omCostPerKW || 500, // ₹500 per kW per year

            // Space requirements
            spacePerKW: config.spacePerKW || 100, // 100 sq ft per kW

            // Financial parameters
            tariffIncreaseRate: config.tariffIncreaseRate || 0.05, // 5% per year
            consumptionIncreaseRate: config.consumptionIncreaseRate || 0.02, // 2% per year
            loanInterestRate: config.loanInterestRate || 0.12, // 12% per annum
            systemLifespan: config.systemLifespan || 25, // 25 years
            inverterReplacementYear: config.inverterReplacementYear || 10,

            // Subsidy rates (PM Surya Ghar Muft Bijli Yojana)
            subsidyRates: config.subsidyRates || {
                residential: {
                    '1-2': 30000, // ₹30,000 for 1-2 kW
                    '2-3': 60000, // ₹60,000 for 2-3 kW
                    '3+': 78000   // ₹78,000 for 3+ kW
                },
                commercial: 0
            },

            // Environmental impact
            co2PerKWh: config.co2PerKWh || 0.82, // kg CO2 per kWh
            treesPerTonCO2: config.treesPerTonCO2 || 50 // trees equivalent
        };
    }

    /**
     * Main calculation method
     * @param {Object} input - User input parameters
     * @returns {Object} Complete solar calculation results
     */
    calculate(input) {
        const {
            propertyType = 'residential',
            monthlyBill = 0,
            monthlyUnits = 0,
            rooftopArea = 0,
            state = 'default',
            eligibleForSubsidy = true
        } = input;

        if (!monthlyBill && !monthlyUnits) {
            throw new Error('Either monthlyBill or monthlyUnits must be provided');
        }

        const avgTariffRate = monthlyBill / monthlyUnits;
        const actualMonthlyUnits = monthlyUnits || (monthlyBill / avgTariffRate);
        const annualConsumption = actualMonthlyUnits * 12;

        const solarIrradiation = this.config.solarIrradiation[state] ||
            this.config.solarIrradiation.default;

        const systemSizeRequired = this.calculateSystemSize(annualConsumption, solarIrradiation);
        const spaceRequired = systemSizeRequired * this.config.spacePerKW;
        const maxSystemSize = rooftopArea ? (rooftopArea / this.config.spacePerKW) : systemSizeRequired;
        const systemSizeRecommended = Math.min(systemSizeRequired, maxSystemSize);

        const annualGeneration = this.calculateAnnualGeneration(systemSizeRecommended, solarIrradiation);

        const systemCost = this.calculateSystemCost(systemSizeRecommended);
        const subsidy = eligibleForSubsidy && propertyType === 'residential'
            ? this.calculateSubsidy(systemSizeRecommended)
            : 0;
        const netSystemCost = systemCost - subsidy;

        const savingsData = this.calculateSavings(annualConsumption, annualGeneration, avgTariffRate, systemSizeRecommended);
        const paybackPeriod = this.calculatePaybackPeriod(netSystemCost, savingsData.firstYearSavings, this.config.tariffIncreaseRate);
        const loanOptions = this.calculateLoanOptions(netSystemCost);
        const environmentalImpact = this.calculateEnvironmentalImpact(annualGeneration);
        const yearlyProjection = this.generateYearlyProjection(annualConsumption, annualGeneration, avgTariffRate, systemSizeRecommended, netSystemCost);

        return {
            systemDetails: {
                sizeRequired: parseFloat(systemSizeRequired.toFixed(2)),
                sizeRecommended: parseFloat(systemSizeRecommended.toFixed(2)),
                spaceRequired: parseFloat(spaceRequired.toFixed(2)),
                spaceRequiredSqM: parseFloat((spaceRequired * 0.092903).toFixed(2)),
                annualGeneration: parseFloat(annualGeneration.toFixed(2)),
                monthlyGeneration: parseFloat((annualGeneration / 12).toFixed(2)),
                dailyGeneration: parseFloat((annualGeneration / 365).toFixed(2)),
                maxSolarPercentage: parseFloat(((annualGeneration / annualConsumption) * 100).toFixed(2))
            },

            financials: {
                systemCost: parseFloat(systemCost.toFixed(2)),
                subsidy: parseFloat(subsidy.toFixed(2)),
                netSystemCost: parseFloat(netSystemCost.toFixed(2)),
                costPerKW: this.config.costPerKW,
                firstYearSavings: parseFloat(savingsData.firstYearSavings.toFixed(2)),
                monthlySavings: parseFloat(savingsData.monthlySavings.toFixed(2)),
                totalSavings25Years: parseFloat(savingsData.totalSavings25Years.toFixed(2)),
                paybackPeriod: parseFloat(paybackPeriod.toFixed(2)),
                roi25Years: parseFloat(((savingsData.totalSavings25Years / netSystemCost) * 100).toFixed(2))
            },

            loanOptions: loanOptions,

            environmentalImpact: {
                co2SavedAnnually: parseFloat(environmentalImpact.co2SavedAnnually.toFixed(2)),
                co2Saved25Years: parseFloat(environmentalImpact.co2Saved25Years.toFixed(2)),
                treesEquivalent: Math.round(environmentalImpact.treesEquivalent),
                coalSavedKg: parseFloat(environmentalImpact.coalSavedKg.toFixed(2))
            },

            yearlyProjection: yearlyProjection
        };
    }

    calculateSystemSize(annualConsumption, solarIrradiation) {
        const dailyConsumption = annualConsumption / 365;
        const dailyGenerationPerKW = solarIrradiation * this.config.performanceRatio;
        return dailyConsumption / dailyGenerationPerKW;
    }

    calculateAnnualGeneration(systemSize, solarIrradiation) {
        const dailyGenerationPerKW = solarIrradiation * this.config.performanceRatio;
        return systemSize * dailyGenerationPerKW * 365;
    }

    calculateSystemCost(systemSize) {
        const panelCost = systemSize * this.config.costPerKW;
        const inverterCost = systemSize * this.config.inverterCostPerKW;
        return panelCost + inverterCost;
    }

    calculateSubsidy(systemSize) {
        const rates = this.config.subsidyRates.residential;
        if (systemSize <= 2) return rates['1-2'];
        else if (systemSize <= 3) return rates['2-3'];
        else return rates['3+'];
    }

    calculateSavings(annualConsumption, annualGeneration, tariffRate, systemSize) {
        const unitsFromSolar = Math.min(annualGeneration, annualConsumption);
        const firstYearSavings = unitsFromSolar * tariffRate;
        const monthlySavings = firstYearSavings / 12;

        let totalSavings = 0;
        let currentTariff = tariffRate;

        for (let year = 1; year <= this.config.systemLifespan; year++) {
            const yearlyGeneration = annualGeneration * Math.pow((1 - this.config.systemDegradation), year - 1);
            const yearlyUnitsFromSolar = Math.min(yearlyGeneration, annualConsumption);
            totalSavings += yearlyUnitsFromSolar * currentTariff;
            currentTariff *= (1 + this.config.tariffIncreaseRate);
        }

        return { firstYearSavings, monthlySavings, totalSavings25Years: totalSavings };
    }

    calculatePaybackPeriod(netCost, firstYearSavings, tariffIncreaseRate) {
        let cumulativeSavings = 0;
        let year = 0;
        let currentSavings = firstYearSavings;

        while (cumulativeSavings < netCost && year < 25) {
            year++;
            cumulativeSavings += currentSavings;
            currentSavings *= (1 + tariffIncreaseRate);
        }

        return year;
    }

    calculateLoanOptions(loanAmount) {
        const tenures = [12, 24, 36, 48, 60];
        const downPaymentPercent = 0.20;
        const downPayment = loanAmount * downPaymentPercent;
        const principalAmount = loanAmount - downPayment;

        return tenures.map(tenure => {
            const monthlyRate = this.config.loanInterestRate / 12;
            const emi = (principalAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
                (Math.pow(1 + monthlyRate, tenure) - 1);

            return {
                tenureMonths: tenure,
                tenureYears: tenure / 12,
                emi: parseFloat(emi.toFixed(2)),
                totalPayment: parseFloat((emi * tenure).toFixed(2)),
                totalInterest: parseFloat((emi * tenure - principalAmount).toFixed(2)),
                downPayment: parseFloat(downPayment.toFixed(2)),
                loanAmount: parseFloat(principalAmount.toFixed(2))
            };
        });
    }

    calculateEnvironmentalImpact(annualGeneration) {
        const co2SavedAnnually = (annualGeneration * this.config.co2PerKWh) / 1000;
        const co2Saved25Years = co2SavedAnnually * this.config.systemLifespan;
        const treesEquivalent = co2Saved25Years * this.config.treesPerTonCO2;
        const coalSavedKg = annualGeneration * 0.6;

        return { co2SavedAnnually, co2Saved25Years, treesEquivalent, coalSavedKg };
    }

    generateYearlyProjection(annualConsumption, annualGeneration, tariffRate, systemSize, netCost) {
        const projection = [];
        let currentTariff = tariffRate;
        let currentConsumption = annualConsumption;
        let cumulativeCashFlow = -netCost;

        for (let year = 1; year <= this.config.systemLifespan; year++) {
            const yearlyGeneration = annualGeneration * Math.pow((1 - this.config.systemDegradation), year - 1);
            const unitsFromSolar = Math.min(yearlyGeneration, currentConsumption);
            const unitsFromGrid = currentConsumption - unitsFromSolar;
            const billWithoutSolar = currentConsumption * currentTariff;
            const billWithSolar = unitsFromGrid * currentTariff;

            let omExpenses = systemSize * this.config.omCostPerKW;
            if (year === this.config.inverterReplacementYear) {
                omExpenses += systemSize * this.config.inverterCostPerKW;
            }

            const yearlySavings = billWithoutSolar - billWithSolar - omExpenses;
            cumulativeCashFlow += yearlySavings;

            projection.push({
                year,
                generationFromSolar: parseFloat(yearlyGeneration.toFixed(2)),
                billWithoutSolar: parseFloat(billWithoutSolar.toFixed(2)),
                billWithSolar: parseFloat(billWithSolar.toFixed(2)),
                yearlySavings: parseFloat(yearlySavings.toFixed(2)),
                cumulativeCashFlow: parseFloat(cumulativeCashFlow.toFixed(2))
            });

            currentTariff *= (1 + this.config.tariffIncreaseRate);
            currentConsumption *= (1 + this.config.consumptionIncreaseRate);
        }

        return projection;
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SolarCalculator;
}
