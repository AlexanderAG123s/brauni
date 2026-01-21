import React, { useEffect, useState } from 'react';
import Card from './Card';
import { Clock, BookOpen, CheckCircle } from 'lucide-react';

const RecentActivity = ({ title = "Actividad Reciente", limit = 5 }) => {
    const [loans, setLoans] = useState([]);

    useEffect(() => {
        const fetchLoans = () => {
            fetch('http://localhost:3000/api/loans')
                .then(res => res.json())
                .then(data => setLoans(data))
                .catch(err => console.error(err));
        };
        
        fetchLoans();
        // Poll every 5 seconds to keep dashboard fresh
        const interval = setInterval(fetchLoans, 5000);
        return () => clearInterval(interval);
    }, []);

    const displayLoans = loans.slice(0, limit);

    return (
        <Card title={title}>
            {displayLoans.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)' }}>
                    <Clock size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                    <p style={{ fontSize: '13px' }}>Sin actividad reciente</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {displayLoans.map(loan => (
                        <div key={loan.id} style={{ display: 'flex', alignItems: 'start', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                            <div style={{ 
                                width: '36px', height: '36px', borderRadius: '8px', 
                                background: loan.status === 'Active' ? 'var(--bg-card-hover)' : 'rgba(16,185,129,0.1)',
                                color: loan.status === 'Active' ? 'var(--text-secondary)' : 'var(--status-success)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {loan.status === 'Active' ? <BookOpen size={18} /> : <CheckCircle size={18} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: '500' }}>
                                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{loan.user_name}</span>
                                    {loan.status === 'Active' ? ' pidió prestado ' : ' devolvió '}
                                    <span style={{ fontStyle: 'italic' }}>{loan.book_title}</span>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                                    {new Date(loan.loan_date).toLocaleDateString()} • {new Date(loan.loan_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default RecentActivity;
