import { useEffect, useState } from "react";
import axios from "axios";

interface Program {
    id: number;
    code: string;
    name: string;
    program_name: string;
    form: string;
    description: string;
    images: Array<{
      id: number;
      image: string;
    }>;
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
      program: number;
    }>;
    career_opportunities: string[];
}
interface EducationLevel {
    id: number;
    name: string;
    code: string;
    programs: Program[];
  }

export const Program = () =>{

    const [programsError, setProgramsError] = useState<string | null>(null);
    const [currentPlashka, setCurrentPlashka] = useState(0);
    const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);

    useEffect(() =>{    
    axios.get<Program[]>("https://tamik327.pythonanywhere.com/api/programs/")
    .then(response => {
      const programs = response.data;
      const levelsMap = new Map<string, EducationLevel>();
      
      programs.forEach(program => {
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
      
      setEducationLevels(Array.from(levelsMap.values()));
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
    
    const getFirstImageUrl = (images: Array<{ id: number; image: string }>): string => {
        return images.length > 0 ? images[0].image : "/path/to/placeholder/image.png";
    };

    return(
        <>
        <h3 className="programm-h">Программы обучения</h3>
      
      {programsError ? (
        <div className="error-message">⚠️ {programsError}</div>
      ) : (
        <>
          <div className="plashka-container">
            {educationLevels.map((level, index) => (
              <div
                key={level.id}
                className={`plashka ${currentPlashka === index ? 'active' : ''}`}
                onClick={() => switchPlashka(index)}
              >
                <div className="plashka-title">{level.name}</div>
              </div>
            ))}
          </div>

          {educationLevels.length > 0 && (
            <div className="programs-container">
              {educationLevels[currentPlashka].programs
                .slice(0, 2) // Берем первые 2 направления
                .map((program) => (
                  <div className="program-card" key={program.id}>
                    <div className="program-header">
                      <h4 className="program-code">{program.code}</h4>
                      <h3 className="program-name">{program.program_name}</h3>
                      <p className="program-form">{program.form}</p>
                    </div>

                    <div className="program-content">
                      {program.images?.length > 0 && (
                        <img
                          src={getFirstImageUrl(program.images)}
                          alt={program.program_name}
                          className="program-image"
                        />
                      )}

                      <div className="program-details">
                        <p className="program-description">{program.description}</p>

                        {program.features?.length > 0 && (
                          <div className="features-section">
                            <h5>Особенности программы:</h5>
                            <div className="features-grid">
                              {program.features.map((feature) => (
                                <div key={feature.id} className="feature-card">
                                  <div className="feature-badge">✓</div>
                                  <div className="feature-content">
                                    <h6>{feature.title}</h6>
                                    <p>{feature.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {program.career_opportunities?.length > 0 && (
                          <div className="career-section">
                            <h5>Карьерные возможности:</h5>
                            <div className="career-tags">
                              {program.career_opportunities.map((item, index) => (
                                <span key={index} className="career-tag">
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
        </>
    )
}