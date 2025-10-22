import type { Knex } from "knex";

// Defines the changes to apply to the database
export async function up(knex: Knex): Promise<void> {
  const userRoles = ['OWNER', 'ADMIN', 'MECHANIC'];
  const quoteStatuses = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'];
  const jobCardStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
  const invoiceStatuses = ['DRAFT', 'SENT', 'PAID', 'VOID'];

  return knex.schema
    // --- Core Entities ---
    .createTable('Organization', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.string('name');
      table.string('address');
      table.string('vatNumber');
      table.string('bankName');
      table.string('accountNumber');
      table.string('branchCode');
      table.timestamp('createdAt').defaultTo(knex.fn.now()).notNullable();
      table.timestamp('updatedAt').defaultTo(knex.fn.now()).notNullable();
    })
    .createTable('User', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.string('name');
      table.string('email').unique();
      table.string('hashedPassword'); // Store hashed password
      table.enu('role', userRoles).defaultTo('MECHANIC').notNullable();
      table.boolean('isActive').defaultTo(true).notNullable();
      table.uuid('organizationId').notNullable();
      table.foreign('organizationId').references('id').inTable('Organization').onDelete('CASCADE');
      table.timestamp('createdAt').defaultTo(knex.fn.now()).notNullable();
      table.timestamp('updatedAt').defaultTo(knex.fn.now()).notNullable();
      table.index('organizationId');
    })
    .createTable('Customer', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.string('firstName').notNullable(); // Made non-nullable
      table.string('lastName');
      table.string('email');
      table.string('phoneNumber');
      table.string('addressLine1');
      table.string('addressLine2');
      table.string('city');
      table.string('postalCode');
      table.uuid('organizationId').notNullable(); // Assuming customer must belong to an Org
      table.foreign('organizationId').references('id').inTable('Organization').onDelete('CASCADE'); // Or RESTRICT if customers shouldn't be deleted with org
      table.timestamp('createdAt').defaultTo(knex.fn.now()).notNullable();
      table.timestamp('updatedAt').defaultTo(knex.fn.now()).notNullable();
      table.index('organizationId');
    })
    .createTable('VehicleMake', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.string('name').unique().notNullable();
      table.timestamp('createdAt').defaultTo(knex.fn.now()).notNullable();
      table.timestamp('updatedAt').defaultTo(knex.fn.now()).notNullable();
    })
    .createTable('VehicleModel', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.string('name').notNullable();
      table.uuid('makeId').notNullable();
      table.foreign('makeId').references('id').inTable('VehicleMake').onDelete('CASCADE'); // If make deleted, delete models
      table.timestamp('createdAt').defaultTo(knex.fn.now()).notNullable();
      table.timestamp('updatedAt').defaultTo(knex.fn.now()).notNullable();
      table.unique(['name', 'makeId']); // Ensure model name unique per make
      table.index('makeId');
    })
    .createTable('Vehicle', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.string('registrationNumber').unique().notNullable();
      table.string('vin').unique();
      table.string('color');
      table.integer('year');
      table.uuid('organizationId').notNullable(); // Vehicle tied to Org
      table.foreign('organizationId').references('id').inTable('Organization').onDelete('CASCADE');
      table.uuid('customerId').notNullable();
      table.foreign('customerId').references('id').inTable('Customer').onDelete('CASCADE'); // If customer deleted, delete vehicle
      table.uuid('makeId').notNullable();
      table.foreign('makeId').references('id').inTable('VehicleMake').onDelete('RESTRICT'); // Don't delete make if vehicles exist
      table.uuid('modelId').notNullable();
      table.foreign('modelId').references('id').inTable('VehicleModel').onDelete('RESTRICT'); // Don't delete model if vehicles exist
      table.timestamp('createdAt').defaultTo(knex.fn.now()).notNullable();
      table.timestamp('updatedAt').defaultTo(knex.fn.now()).notNullable();
      table.index(['organizationId', 'customerId', 'makeId', 'modelId']);
    })
    .createTable('ServiceItem', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.text('description').notNullable(); // Use text for longer descriptions
      table.float('defaultPrice'); // Use float or decimal for currency
      table.uuid('organizationId').notNullable(); // Tied to Org
      table.foreign('organizationId').references('id').inTable('Organization').onDelete('CASCADE');
      table.timestamp('createdAt').defaultTo(knex.fn.now()).notNullable();
      table.timestamp('updatedAt').defaultTo(knex.fn.now()).notNullable();
      table.index('organizationId');
    })

    // --- Workflow Tables ---
    .createTable('Quote', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.string('quoteNumber').unique().notNullable(); // Need a way to generate this sequence
      table.enu('status', quoteStatuses).defaultTo('DRAFT').notNullable();
      table.text('clientInstructions');
      table.uuid('organizationId').notNullable();
      table.foreign('organizationId').references('id').inTable('Organization').onDelete('CASCADE');
      table.uuid('customerId').notNullable();
      table.foreign('customerId').references('id').inTable('Customer').onDelete('RESTRICT'); // Don't delete customer if quotes exist? Or CASCADE?
      table.uuid('vehicleId').notNullable();
      table.foreign('vehicleId').references('id').inTable('Vehicle').onDelete('RESTRICT'); // Don't delete vehicle if quotes exist? Or CASCADE?
      table.float('subTotal').defaultTo(0).notNullable();
      table.float('vatAmount').defaultTo(0).notNullable();
      table.float('total').defaultTo(0).notNullable();
      table.timestamp('sentAt');
      table.timestamp('acceptedAt');
      table.timestamp('createdAt').defaultTo(knex.fn.now()).notNullable();
      table.timestamp('updatedAt').defaultTo(knex.fn.now()).notNullable();
      table.index(['organizationId', 'customerId', 'vehicleId', 'status']);
    })
    .createTable('JobCard', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.string('jobCardNumber').unique().notNullable(); // Need sequence
      table.enu('status', jobCardStatuses).defaultTo('PENDING').notNullable();
      table.integer('odometerReading');
      table.text('mechanicNotes');
      table.uuid('organizationId').notNullable();
      table.foreign('organizationId').references('id').inTable('Organization').onDelete('CASCADE');
      table.uuid('customerId').notNullable();
      table.foreign('customerId').references('id').inTable('Customer').onDelete('RESTRICT');
      table.uuid('vehicleId').notNullable();
      table.foreign('vehicleId').references('id').inTable('Vehicle').onDelete('RESTRICT');
      table.uuid('quoteId').unique(); // Link back to quote
      table.foreign('quoteId').references('id').inTable('Quote').onDelete('SET NULL'); // Keep JobCard if Quote deleted? Or RESTRICT?
      table.float('subTotal').defaultTo(0).notNullable();
      table.float('vatAmount').defaultTo(0).notNullable();
      table.float('total').defaultTo(0).notNullable();
      table.timestamp('completedAt');
      table.timestamp('createdAt').defaultTo(knex.fn.now()).notNullable();
      table.timestamp('updatedAt').defaultTo(knex.fn.now()).notNullable();
      table.index(['organizationId', 'customerId', 'vehicleId', 'status', 'quoteId']);
    })
    .createTable('Invoice', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.string('invoiceNumber').unique().notNullable(); // Need sequence
      table.enu('status', invoiceStatuses).defaultTo('DRAFT').notNullable();
      table.timestamp('invoiceDate').defaultTo(knex.fn.now()).notNullable();
      table.timestamp('dueDate');
      table.uuid('organizationId').notNullable();
      table.foreign('organizationId').references('id').inTable('Organization').onDelete('CASCADE');
      table.uuid('customerId').notNullable();
      table.foreign('customerId').references('id').inTable('Customer').onDelete('RESTRICT');
      table.uuid('vehicleId').notNullable();
      table.foreign('vehicleId').references('id').inTable('Vehicle').onDelete('RESTRICT');
      table.uuid('jobCardId').unique(); // Link back to job card
      table.foreign('jobCardId').references('id').inTable('JobCard').onDelete('SET NULL'); // Keep Invoice if JobCard deleted? Or RESTRICT?
      table.float('subTotal').defaultTo(0).notNullable();
      table.float('vatAmount').defaultTo(0).notNullable();
      table.float('total').defaultTo(0).notNullable();
      table.boolean('isImmutable').defaultTo(false).notNullable();
      table.timestamp('sentAt');
      table.timestamp('paidAt');
      table.timestamp('createdAt').defaultTo(knex.fn.now()).notNullable();
      table.timestamp('updatedAt').defaultTo(knex.fn.now()).notNullable();
      table.index(['organizationId', 'customerId', 'vehicleId', 'status', 'jobCardId']);
    })
    .createTable('LineItem', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.text('description').notNullable();
      table.integer('quantity').defaultTo(1).notNullable();
      table.float('unitPrice').notNullable();
      table.float('total').notNullable(); // Store calculated total
      table.uuid('serviceItemId'); // Optional link to library
      table.foreign('serviceItemId').references('id').inTable('ServiceItem').onDelete('SET NULL'); // Keep item if library entry deleted
      table.uuid('quoteId');
      table.foreign('quoteId').references('id').inTable('Quote').onDelete('CASCADE'); // Delete line items if quote deleted
      table.uuid('jobCardId');
      table.foreign('jobCardId').references('id').inTable('JobCard').onDelete('CASCADE'); // Delete line items if job card deleted
      table.uuid('invoiceId');
      table.foreign('invoiceId').references('id').inTable('Invoice').onDelete('CASCADE'); // Delete line items if invoice deleted
      table.timestamp('createdAt').defaultTo(knex.fn.now()).notNullable();
      table.timestamp('updatedAt').defaultTo(knex.fn.now()).notNullable();
      // Add check constraint later to ensure only one of quoteId, jobCardId, invoiceId is set
      table.index(['serviceItemId', 'quoteId', 'jobCardId', 'invoiceId']);
    });
}

export async function down(knex: Knex): Promise<void> {
  // Drop tables in reverse order of creation due to foreign key constraints
  return knex.schema
    .dropTableIfExists('LineItem')
    .dropTableIfExists('Invoice')
    .dropTableIfExists('JobCard')
    .dropTableIfExists('Quote')
    .dropTableIfExists('ServiceItem')
    .dropTableIfExists('Vehicle')
    .dropTableIfExists('VehicleModel')
    .dropTableIfExists('VehicleMake')
    .dropTableIfExists('Customer')
    .dropTableIfExists('User')
    .dropTableIfExists('Organization');
}