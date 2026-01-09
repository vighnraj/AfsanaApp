// Lead Context - Manages lead state (mirrors web frontend's LeadContext)

import React, { createContext, useState, useContext } from 'react';

// Create context
const LeadContext = createContext(null);

export const LeadProvider = ({ children }) => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);

    // Update lead status
    const updateLeadStatus = (leadId, newStatus) => {
        setLeads((prevLeads) =>
            prevLeads.map((lead) =>
                lead.id === leadId ? { ...lead, status: newStatus } : lead
            )
        );
    };

    // Add a new lead
    const addLead = (lead) => {
        setLeads((prevLeads) => [...prevLeads, lead]);
    };

    // Remove a lead
    const removeLead = (leadId) => {
        setLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== leadId));
    };

    // Update a lead
    const updateLead = (leadId, updates) => {
        setLeads((prevLeads) =>
            prevLeads.map((lead) =>
                lead.id === leadId ? { ...lead, ...updates } : lead
            )
        );
    };

    // Set all leads
    const setAllLeads = (newLeads) => {
        setLeads(newLeads);
    };

    const value = {
        leads,
        loading,
        selectedLead,
        setLoading,
        setSelectedLead,
        updateLeadStatus,
        addLead,
        removeLead,
        updateLead,
        setAllLeads,
    };

    return (
        <LeadContext.Provider value={value}>
            {children}
        </LeadContext.Provider>
    );
};

// Custom hook to use lead context
export const useLead = () => {
    const context = useContext(LeadContext);
    if (!context) {
        throw new Error('useLead must be used within a LeadProvider');
    }
    return context;
};

export default LeadContext;
