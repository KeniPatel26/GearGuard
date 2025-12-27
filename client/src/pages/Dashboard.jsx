import React from 'react'
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/useAuth';
import { replace, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

function Dashboard() {
    const { user } = useApp();
    const navigate = useNavigate();

    const logout = useLogout();
    const queryClient = useQueryClient();
    const handleLogout = () => {
        logout.mutate(undefined, {
            onSuccess: () => {
                queryClient.clear();
                toast.success("Logged out successfully.");
                navigate("/login", { replace: true });
            }
        });
    }
    if (logout.isPending) {
        return <div>Loading...</div>
    }
    return (
        <div>
            Dashboard
            {<div>Welcome, {user?.email}!</div>}
            <Button variant='default' onClick={handleLogout}>Logout</Button>
        </div>
    )
}

export default Dashboard