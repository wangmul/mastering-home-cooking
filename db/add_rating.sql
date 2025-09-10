-- Add a rating column to the recipes table
ALTER TABLE public.recipes
ADD COLUMN rating TEXT;

-- You can also add a check constraint to only allow specific values
-- ALTER TABLE public.recipes
-- ADD CONSTRAINT recipes_rating_check CHECK (rating IN ('망했음', '먹을만', '대박'));
