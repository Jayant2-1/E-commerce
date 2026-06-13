-- =====================================================
-- V9: Support multiple named wishlists per user
-- =====================================================

-- Add name column to wishlists
ALTER TABLE wishlists ADD COLUMN name VARCHAR(100) NOT NULL DEFAULT 'My Wishlist';

-- Remove unique constraint on user_id (allow multiple wishlists per user)
ALTER TABLE wishlists DROP INDEX uk_wishlists_user;

-- Add unique constraint on user_id + name combination
ALTER TABLE wishlists ADD CONSTRAINT uk_wishlists_user_name UNIQUE (user_id, name);