// assets/js/supabase-config.js
// Supabase client configuration with Vercel environment variables

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.4/+esm';

// Get environment variables from Vercel (or fallback for local development)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Validate credentials exist
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables!');
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel');
}

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// AUTHENTICATION FUNCTIONS
// ============================================================

export async function signUp(email, password, username) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username
                }
            }
        });

        if (error) {
            console.error('Sign up error:', error.message);
            return { success: false, error: error.message };
        }

        const { error: dbError } = await supabase
            .from('users')
            .insert([
                {
                    id: data.user.id,
                    email: email,
                    username: username
                }
            ]);

        if (dbError) {
            console.error('Database error:', dbError.message);
            return { success: false, error: dbError.message };
        }

        return { success: true, data: data };
    } catch (error) {
        console.error('Unexpected error:', error);
        return { success: false, error: error.message };
    }
}

export async function logIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Login error:', error.message);
            return { success: false, error: error.message };
        }

        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (userError) {
            console.error('User fetch error:', userError.message);
            return { success: false, error: userError.message };
        }

        return { success: true, user: userData };
    } catch (error) {
        console.error('Unexpected error:', error);
        return { success: false, error: error.message };
    }
}

export async function logOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout error:', error.message);
            return { success: false, error: error.message };
        }
        return { success: true };
    } catch (error) {
        console.error('Unexpected error:', error);
        return { success: false, error: error.message };
    }
}

export async function getCurrentUser() {
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session?.user || null;
    } catch (error) {
        console.error('Get user error:', error.message);
        return null;
    }
}

export async function resetPassword(email) {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password.html`
        });
        
        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true };
    } catch (error) {
        console.error('Reset password error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================
// TASK FUNCTIONS
// ============================================================

export async function addTask(userId, task) {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .insert([
                {
                    user_id: userId,
                    task: task,
                    status: 'pending'
                }
            ])
            .select();

        if (error) {
            console.error('Add task error:', error.message);
            return { success: false, error: error.message };
        }

        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Unexpected error:', error);
        return { success: false, error: error.message };
    }
}

export async function getTasks(userId) {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Get tasks error:', error.message);
            return { success: false, error: error.message };
        }

        return { success: true, data: data };
    } catch (error) {
        console.error('Unexpected error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateTask(taskId, updates) {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', taskId)
            .select();

        if (error) {
            console.error('Update task error:', error.message);
            return { success: false, error: error.message };
        }

        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Unexpected error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteTask(taskId) {
    try {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId);

        if (error) {
            console.error('Delete task error:', error.message);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Unexpected error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================
// REAL-TIME SUBSCRIPTION
// ============================================================

export function subscribeToTasks(userId, callback) {
    const subscription = supabase
        .channel(`tasks_${userId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'tasks',
                filter: `user_id=eq.${userId}`
            },
            (payload) => {
                console.log('Real-time update:', payload);
                callback(payload);
            }
        )
        .subscribe((status) => {
            console.log('Subscription status:', status);
        });

    return subscription;
}

export function unsubscribeFromTasks(subscription) {
    if (subscription) {
        supabase.removeChannel(subscription);
    }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

export function getAuthToken() {
    return localStorage.getItem('sb-auth-token');
}

export function clearAuthToken() {
    localStorage.removeItem('sb-auth-token');
}