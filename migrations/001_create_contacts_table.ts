import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('contacts', (table) => {
    table.increments('id').primary();
    table.string('phoneNumber', 20).nullable();
    table.string('email', 255).nullable();
    table.integer('linkedId').nullable();
    table.enum('linkPrecedence', ['primary', 'secondary']).notNullable();
    table.timestamps(true, true);
    table.timestamp('deletedAt').nullable();

    // Add foreign key constraint
    table.foreign('linkedId').references('id').inTable('contacts').onDelete('SET NULL');

    // Add check constraint to ensure at least one identifier is present
    table.check('?? IS NOT NULL OR ?? IS NOT NULL', ['email', 'phoneNumber']);

    // Add indexes for better performance
    table.index('email', 'idx_contacts_email');
    table.index('phoneNumber', 'idx_contacts_phone');
    table.index('linkedId', 'idx_contacts_linked_id');
    table.index('linkPrecedence', 'idx_contacts_precedence');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('contacts');
}
