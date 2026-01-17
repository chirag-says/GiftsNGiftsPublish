import React from 'react';
import './Loading.css';

/**
 * Loading Component
 * Used as fallback for React.lazy() code splitting
 * Provides visual feedback while lazy-loaded components are loading
 */
const Loading = () => {
    return (
        <div className="loading-container">
            <div className="loading-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
            </div>
            <p className="loading-text">Loading...</p>
        </div>
    );
};

export default Loading;
