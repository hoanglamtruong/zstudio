-- Split the old ADMIN role's user-management side into a new ASSISTANT
-- role: Assistant manages user accounts (approve/rename/reset password/
-- hide/delete/role), Admin keeps full content access and now also assigns
-- module permissions to Staff. Manager stays the sole full-access role.

ALTER TYPE "Role" ADD VALUE 'ASSISTANT';
