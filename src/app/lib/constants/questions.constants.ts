import { type Question } from "../interfaces/questions.interface";

export const QUESTIONS: Question[] = [
    {
        label: '1. ¿Cuál es el principal objetivo de la Rosuvastatina?',
        options: [
            {
                label: 'Reducir el azúcar en sangre',
                correct: false
            },
            {
                label: 'Reducir el colesterol LDL',
                correct: true
            },
            {
                label: 'Mejorar la digestión',
                correct: false
            },
            {
                label: 'Aumentar el colesterol HDL',
                correct: false
            }
        ]
    },
    {
        label: '2. ¿En qué casos se recomienda principalmente el uso de rosuvastatina?',
        options: [
            {
                label: 'Para bajar la fiebre',
                correct: false
            },
            {
                label: 'Para reducir el colesterol LDL en pacientes con riesgo cardiovascular',
                correct: true
            },
            {
                label: 'Para aumentar la energía',
                correct: false
            },
            {
                label: 'Para tratar la hipertensión',
                correct: false
            }
        ]
    },
    {
        label: '3. ¿Cómo contribuye la rosuvastatina a la salud cardiovascular?',
        options: [
            {
                label: 'Aumenta el colesterol bueno (HDL)',
                correct: false
            },
            {
                label: 'Disminuye el colesterol malo (LDL)',
                correct: true
            },
            {
                label: 'Mejora la circulación sanguínea',
                correct: false
            },
            {
                label: 'Regula el azúcar en la sangre',
                correct: false
            }
        ]
    },
    {
        label: '4. ¿Cuál es uno de los principales beneficios de la Rosuvastatina en comparación con otras estatinas?',
        options: [
            {
                label: 'Es más económica',
                correct: false
            },
            {
                label: 'Tiene menos efectos secundarios',
                correct: false
            },
            {
                label: 'Actúa más rápido para reducir el colesterol',
                correct: true
            },
            {
                label: 'Se puede tomar en cualquier momento del día',
                correct: false
            }
        ]
    },
    {
        label: '5. ¿Por qué es bueno recomendar Rosuvastatina a pacientes con colesterol elevado y alto riesgo cardiovascular?',
        options: [
            {
                label: 'Porque es un medicamento natural',
                correct: false
            },
            {
                label: 'Porque reduce eficazmente el colesterol LDL y previene enfermedades del corazón',
                correct: true
            },
            {
                label: 'Porque mejora la digestión',
                correct: false
            },
            {
                label: 'Porque aumenta los niveles de colesterol HDL',
                correct: false
            }
        ]
    }
]