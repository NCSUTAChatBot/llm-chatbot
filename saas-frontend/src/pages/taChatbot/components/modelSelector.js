import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles, Zap } from 'lucide-react';


export function ModelSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const NAVBAR_HEADER = "Virtual TA";
    const REACT_APP_COURSE_NUMBER = process.env.REACT_APP_COURSE_NUMBER;
    const REACT_APP_COURSE_TITLE = process.env.REACT_APP_COURSE_TITLE;
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
          if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setIsOpen(false);
          }
        }
      
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, []);
      

    return (
        <div ref={dropdownRef} className="model-selector">
            <button className="model-button" onClick={() => setIsOpen(!isOpen)}>
                <div className="model-header">{NAVBAR_HEADER}</div>
                <span className="model-footer">{REACT_APP_COURSE_NUMBER}</span>
                <ChevronDown className="chevron-icon" />
            </button>

            {isOpen && (
                <div className="dropdown-content">
                    <button className="dropdown-item">
                        <Sparkles className="icon" />
                        <div className="model-info">
                            <div className="model-name">GPT-4o mini</div>
                            <div className="model-description">
                                {REACT_APP_COURSE_NUMBER}: {REACT_APP_COURSE_TITLE}
                            </div>
                        </div>
                    </button>

                    {/* <div className="dropdown-separator" /> */}


                </div>
            )}
        </div>
    );
}
