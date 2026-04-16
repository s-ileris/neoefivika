import { CollectionConfig } from 'payload'
import { adminsAndAuthor } from './access/adminsAndAuthor'
import { admins } from './access/admins'
import { checkRole } from './access/checkRole'
import { protectRoles } from './hooks/protectRoles'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: adminsAndAuthor,
    create: () => true,
    update: adminsAndAuthor,
    delete: admins,
    unlock: admins,
    admin: ({ req: { user } }) => checkRole(['admin', 'author'], user),
  },
  fields: [
    { name: 'profile', type: 'relationship', relationTo: 'profiles' },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      saveToJWT: true,
      access: {
        //@ts-ignore
        read: admins,
        //@ts-ignore
        update: admins,
        //@ts-ignore
        create: admins,
      },
      hooks: {
        beforeChange: [protectRoles],
      },
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Author',
          value: 'author',
        },
        {
          label: 'User',
          value: 'user',
        },
      ],
    },
  ],
}
