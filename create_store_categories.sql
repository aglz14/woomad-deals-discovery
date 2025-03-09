-- Create the store_categories table
CREATE TABLE IF NOT EXISTS public.store_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, category_id)
);

-- Add RLS policies
ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to select store_categories
CREATE POLICY IF NOT EXISTS select_store_categories ON public.store_categories
    FOR SELECT USING (true);

-- Allow authenticated users to insert their own store_categories
CREATE POLICY IF NOT EXISTS insert_store_categories ON public.store_categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE id = store_id AND user_id = auth.uid()
        )
    );

-- Allow authenticated users to update their own store_categories
CREATE POLICY IF NOT EXISTS update_store_categories ON public.store_categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE id = store_id AND user_id = auth.uid()
        )
    );

-- Allow authenticated users to delete their own store_categories
CREATE POLICY IF NOT EXISTS delete_store_categories ON public.store_categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE id = store_id AND user_id = auth.uid()
        )
    ); 