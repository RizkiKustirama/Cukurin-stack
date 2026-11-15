import { PrismaClient, UserRole, SubscriptionStatus, SubscriptionPlan, QueueStrategy, BarberWorkStatus, EmploymentType, PayoutCycle, AssetCondition } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Cukurin database seeding...");

  // 1. Clean existing seed data if any (in reverse dependency order)
  await prisma.commissionLedger.deleteMany({});
  await prisma.pettyCashExpense.deleteMany({});
  await prisma.ticketPayment.deleteMany({});
  await prisma.ticketItem.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.dailyRegister.deleteMany({});
  await prisma.storeAsset.deleteMany({});
  await prisma.storeConsumption.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.barberProfile.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.tenant.deleteMany({});

  console.log("🧹 Previous data cleared.");

  // Password hashes
  const superadminPasswordHash = await bcrypt.hash("superadmin123", 10);
  const ownerPasswordHash = await bcrypt.hash("password123", 10);
  const cashierPasswordHash = await bcrypt.hash("kasir123", 10);
  const barberPasswordHash = await bcrypt.hash("barber123", 10);

  // 2. Create Global Platform Superadmin
  const superAdmin = await prisma.user.create({
    data: {
      name: "Super Admin Cukurin",
      phone: "08000000000",
      email: "admin@cukurin.app",
      passwordHash: superadminPasswordHash,
      role: UserRole.SUPERADMIN,
      isActive: true,
    },
  });

  console.log(`👑 Superadmin created: ${superAdmin.name} (${superAdmin.email})`);

  // 3. Create Example Tenant
  const now = new Date();
  const trialEnds = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const subEnds = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const tenant = await prisma.tenant.create({
    data: {
      name: "PT Ganteng Maksimal Barbershop",
      slug: "ganteng-maksimal",
      brandName: "Ganteng Maksimal",
      logoUrl: "/images/logo.png",
      primaryColor: "#D97706",
      isOnboarded: true,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      subscriptionPlan: SubscriptionPlan.PRO,
      trialEndsAt: trialEnds,
      subscriptionEndsAt: subEnds,
      maxStores: 2,
      maxBarbers: 10,
    },
  });

  console.log(`✅ Tenant created: ${tenant.brandName} (${tenant.slug})`);

  // 4. Create Example Store
  const store = await prisma.store.create({
    data: {
      tenantId: tenant.id,
      name: "Ganteng Maksimal - Cabang Tebet",
      address: "Jl. Tebet Raya No. 42, Tebet, Jakarta Selatan",
      phone: "081234567890",
      queueStrategy: QueueStrategy.LOYALTY_PRIORITY,
    },
  });

  console.log(`✅ Store created: ${store.name}`);

  // 5. Create Users (Owner & Cashier)
  const ownerUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: "Budi Handoko (Owner)",
      phone: "08111111111",
      email: "owner@gantengmaksimal.com",
      passwordHash: ownerPasswordHash,
      role: UserRole.OWNER,
    },
  });

  const cashierUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      storeId: store.id,
      name: "Siti Rahma (Kasir)",
      phone: "08222222222",
      email: "kasir@gantengmaksimal.com",
      passwordHash: cashierPasswordHash,
      role: UserRole.CASHIER,
    },
  });

  console.log(`✅ Users created: ${ownerUser.name}, ${cashierUser.name}`);

  // 6. Create 5 Barbers with Profiles
  const barberData = [
    { name: "Rian Barber", phone: "08333333301", status: BarberWorkStatus.READY },
    { name: "Dedi Fade", phone: "08333333302", status: BarberWorkStatus.READY },
    { name: "Agus Pomade", phone: "08333333303", status: BarberWorkStatus.BUSY },
    { name: "Fajar Scissors", phone: "08333333304", status: BarberWorkStatus.BREAK },
    { name: "Eko Classic", phone: "08333333305", status: BarberWorkStatus.OFFLINE },
  ];

  const createdBarbers = [];

  for (const b of barberData) {
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        storeId: store.id,
        name: b.name,
        phone: b.phone,
        passwordHash: barberPasswordHash,
        role: UserRole.BARBER,
      },
    });

    const profile = await prisma.barberProfile.create({
      data: {
        userId: user.id,
        storeId: store.id,
        employmentType: EmploymentType.PERMANENT,
        baseSalary: 1500000.0,
        serviceCommissionPct: 50.0,
        productCommissionFlat: 5000.0,
        payoutCycle: PayoutCycle.DAILY,
        workStatus: b.status,
        lastReadyAt: b.status === BarberWorkStatus.READY ? new Date() : null,
      },
    });

    createdBarbers.push({ user, profile });
  }

  console.log(`✅ 5 Barbers created with active profiles.`);

  // 7. Create Services (Paket Cukur)
  const services = await Promise.all([
    prisma.service.create({
      data: {
        storeId: store.id,
        name: "Potong Rambut Reguler",
        description: "Potong rambut rapi, cuci handuk hangat, dan styling pomade",
        price: 40000.0,
        durationMinutes: 30,
      },
    }),
    prisma.service.create({
      data: {
        storeId: store.id,
        name: "Paket Ganteng Maksimal",
        description: "Potong rambut, keramas, pijat pundak & kepala, plus hot towel",
        price: 65000.0,
        durationMinutes: 45,
      },
    }),
    prisma.service.create({
      data: {
        storeId: store.id,
        name: "Cukur Jenggot / Kumis (Beard Trim)",
        description: "Rapikan kumis & jenggot dengan razor steril dan aftershave",
        price: 25000.0,
        durationMinutes: 20,
      },
    }),
    prisma.service.create({
      data: {
        storeId: store.id,
        name: "Hair Coloring / Bleaching",
        description: "Pewarnaan rambut trendi dengan cat berkualitas tanpa merusak rambut",
        price: 120000.0,
        durationMinutes: 60,
      },
    }),
    prisma.service.create({
      data: {
        storeId: store.id,
        name: "Kids Haircut",
        description: "Potong rambut anak ramah dan sabar",
        price: 35000.0,
        durationMinutes: 30,
      },
    }),
  ]);

  console.log(`✅ ${services.length} Services created.`);

  // 8. Create Retail Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        storeId: store.id,
        name: "Ganteng Clay Matte Finish 100g",
        costPrice: 45000.0,
        sellingPrice: 85000.0,
        stockQuantity: 24,
        minStockAlert: 5,
      },
    }),
    prisma.product.create({
      data: {
        storeId: store.id,
        name: "Ganteng Pomade Oilbased Heavy 100g",
        costPrice: 40000.0,
        sellingPrice: 75000.0,
        stockQuantity: 18,
        minStockAlert: 5,
      },
    }),
    prisma.product.create({
      data: {
        storeId: store.id,
        name: "Texture Dust Styling Powder 20g",
        costPrice: 35000.0,
        sellingPrice: 70000.0,
        stockQuantity: 30,
        minStockAlert: 5,
      },
    }),
    prisma.product.create({
      data: {
        storeId: store.id,
        name: "Beard Oil Sandalwood 30ml",
        costPrice: 40000.0,
        sellingPrice: 80000.0,
        stockQuantity: 12,
        minStockAlert: 3,
      },
    }),
    prisma.product.create({
      data: {
        storeId: store.id,
        name: "Hair Tonic Cool Menthol 150ml",
        costPrice: 30000.0,
        sellingPrice: 60000.0,
        stockQuantity: 20,
        minStockAlert: 4,
      },
    }),
  ]);

  console.log(`✅ ${products.length} Products created.`);

  // 9. Create Customers (CRM)
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        tenantId: tenant.id,
        name: "Andi Wijaya",
        phone: "081298765432",
        haircutNotes: "Low fade samping 1.5, atas sisir menyamping kiri, jangan terlalu tipis",
        visitCount: 6,
      },
    }),
    prisma.customer.create({
      data: {
        tenantId: tenant.id,
        name: "Bambang Pamungkas",
        phone: "081211223344",
        haircutNotes: "Taper fade bersih, jambang dihabiskan",
        visitCount: 3,
      },
    }),
  ]);

  console.log(`✅ ${customers.length} Customers created.`);

  // 10. Create Store Assets (Tools)
  await Promise.all([
    prisma.storeAsset.create({
      data: {
        storeId: store.id,
        name: "Wahl Cordless Magic Clip",
        serialNumber: "WHL-MC-2024-001",
        currentHolderId: createdBarbers[0].profile.id,
        condition: AssetCondition.GOOD,
      },
    }),
    prisma.storeAsset.create({
      data: {
        storeId: store.id,
        name: "Wahl Cordless Senior",
        serialNumber: "WHL-SR-2024-002",
        currentHolderId: createdBarbers[1].profile.id,
        condition: AssetCondition.GOOD,
      },
    }),
    prisma.storeAsset.create({
      data: {
        storeId: store.id,
        name: "Babyliss Pro RoseFX Clipper",
        serialNumber: "BBL-FX-2024-003",
        currentHolderId: createdBarbers[2].profile.id,
        condition: AssetCondition.GOOD,
      },
    }),
    prisma.storeAsset.create({
      data: {
        storeId: store.id,
        name: "Hair Dryer Dyson Supersonic",
        serialNumber: "DYS-SUP-2024-099",
        condition: AssetCondition.GOOD,
      },
    }),
  ]);

  console.log(`✅ Store Assets created.`);

  // 11. Open Today's Daily Register (Buku Kas Pagi)
  const dailyRegister = await prisma.dailyRegister.create({
    data: {
      storeId: store.id,
      cashierId: cashierUser.id,
      openingCash: 200000.0,
      status: "OPEN",
      notes: "Buka kasir pagi shift 1 oleh Siti",
    },
  });

  console.log(`✅ Daily Register opened with initial cash: Rp 200.000 (ID: ${dailyRegister.id})`);

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
