import { useEffect, useState } from "react";
import axios from "axios";
import { ApiEndpointHelper } from "../../Context/AuthContext";

interface Program {
    id: number;
    code: string;
    name: string;
    program_name: string;
    form: string;
    form_display: string;
    description: string;
    department: {
      id: number;
      name: string;
    };
    level: {
      id: number;
      name: string;
      code: string;
    };
    features: Array<{
      id: number;
      title: string;
      description: string;
      order: number;
    }>;
    career_opportunities_list: string[];
    is_active: boolean;
    updated_at: string | null;
}

interface Department {
    id: number;
    name: string;
    programs: Program[];
}

interface EducationLevel {
    id: number;
    name: string;
    code: string;
    programs: Program[];
}

export const Program = () => {
    const [programsError, setProgramsError] = useState<string | null>(null);
    const [currentPlashka, setCurrentPlashka] = useState(0);
    const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);

    const organizeByEducationLevel = (departments: Department[]): EducationLevel[] => {
        const levelsMap = new Map<string, EducationLevel>();
        
        departments.forEach(department => {
            department.programs.forEach(program => {
                const level = program.level;
                if (!levelsMap.has(level.code)) {
                    levelsMap.set(level.code, {
                        id: level.id,
                        name: level.name,
                        code: level.code,
                        programs: []
                    });
                }
                levelsMap.get(level.code)?.programs.push(program);
            });
        });
        
        return Array.from(levelsMap.values());
    };

    useEffect(() => {    
        axios.get<Department[]>(ApiEndpointHelper.departaments(),{
            withCredentials:true
        })
            .then(response => {
                setEducationLevels(organizeByEducationLevel(response.data));
                setProgramsError(null);
            })
            .catch(error => {
                console.error("Ошибка при загрузке программ:", error);
                setProgramsError("Не удалось загрузить программы обучения. Пожалуйста, попробуйте позже.");
            });
    }, []);

    const switchPlashka = (index: number) => {
        setCurrentPlashka(index);
    };

    return(
        <div className="pg-container">
            <h3 className="pg-header">Программы обучения</h3>
          
            {programsError ? (
                <div className="pg-error-message">⚠️ {programsError}</div>
            ) : (
                <>
                    <div className="pg-plashka-container">
                        {educationLevels.map((level, index) => (
                            <div
                                key={level.id}
                                className={`pg-plashka ${currentPlashka === index ? 'pg-active' : ''}`}
                                onClick={() => switchPlashka(index)}
                            >
                                <div className="pg-plashka-title">{level.name}</div>
                            </div>
                        ))}
                    </div>

                    {educationLevels.length > 0 && (
                        <div className="pg-programs-container">
                            {educationLevels[currentPlashka].programs
                                .slice(0, 2)
                                .map((program) => (
                                    <div className="pg-program-card" key={program.id}>
                                        <div className="pg-program-header">
                                            <h4 className="pg-program-code">{program.code}</h4>
                                            <h3 className="pg-program-name">{program.program_name}</h3>
                                            <p className="pg-program-form">{program.form_display}</p>
                                        </div>

                                        <div className="pg-program-content">
                                            <div className="pg-program-details">
                                                <p className="pg-program-description">{program.description}</p>

                                                {program.features?.length > 0 && (
                                                    <div className="pg-features-section">
                                                        <h5>Особенности программы:</h5>
                                                        <div className="pg-features-grid">
                                                            {program.features.map((feature) => (
                                                                <div key={feature.id} className="pg-feature-card">
                                                                    <div className="pg-feature-badge">✓</div>
                                                                    <div className="pg-feature-content">
                                                                        <h6>{feature.title}</h6>
                                                                        <p>{feature.description}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {program.career_opportunities_list?.length > 0 && (
                                                    <div className="pg-career-section">
                                                        <h5>Карьерные возможности:</h5>
                                                        <div className="pg-career-tags">
                                                            {program.career_opportunities_list.map((item, index) => (
                                                                <span key={index} className="pg-career-tag">
                                                                    {item}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}