import { AppDataSource } from "../data-source"
import { User, Task, Category } from "../entities"
import { UserRole, TaskStatus, Priority } from "@task-app/shared"
import * as bcrypt from "bcrypt"

async function seed() {
  await AppDataSource.initialize()

  const userRepository = AppDataSource.getRepository(User)
  const categoryRepository = AppDataSource.getRepository(Category)
  const taskRepository = AppDataSource.getRepository(Task)

  console.log("🌱 Seeding database...")

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10)
  const admin = userRepository.create({
    email: "admin@taskapp.com",
    password: adminPassword,
    name: "Admin User",
    role: UserRole.ADMIN,
  })
  await userRepository.save(admin)
  console.log("✅ Admin user created")

  // Create demo user
  const userPassword = await bcrypt.hash("user123", 10)
  const demoUser = userRepository.create({
    email: "demo@taskapp.com",
    password: userPassword,
    name: "Demo User",
    role: UserRole.USER,
  })
  await userRepository.save(demoUser)
  console.log("✅ Demo user created")

  // Create categories
  const categories = [
    { name: "Trabalho", color: "#3B82F6", icon: "briefcase" },
    { name: "Pessoal", color: "#22C55E", icon: "user" },
    { name: "Estudos", color: "#8B5CF6", icon: "book" },
    { name: "Saúde", color: "#EF4444", icon: "heart" },
  ]

  const savedCategories: Category[] = []
  for (const cat of categories) {
    const category = categoryRepository.create({
      ...cat,
      userId: demoUser.id,
    })
    savedCategories.push(await categoryRepository.save(category))
  }
  console.log("✅ Categories created")

  // Create sample tasks
  const tasks = [
    {
      title: "Finalizar relatório mensal",
      description: "Compilar dados de vendas e criar apresentação para diretoria",
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      estimatedHours: 8,
      tags: ["relatório", "vendas"],
      categoryId: savedCategories[0].id,
    },
    {
      title: "Estudar TypeScript avançado",
      description: "Decorators, generics e utility types",
      status: TaskStatus.PENDING,
      priority: Priority.MEDIUM,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      estimatedHours: 20,
      tags: ["typescript", "estudos"],
      categoryId: savedCategories[2].id,
    },
    {
      title: "Agendar consulta médica",
      description: "Checkup anual",
      status: TaskStatus.PENDING,
      priority: Priority.LOW,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      tags: ["saúde", "pessoal"],
      categoryId: savedCategories[3].id,
    },
    {
      title: "Revisar código do PR #42",
      description: "Code review da feature de autenticação",
      status: TaskStatus.IN_REVIEW,
      priority: Priority.URGENT,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      estimatedHours: 2,
      tags: ["code-review", "auth"],
      categoryId: savedCategories[0].id,
    },
    {
      title: "Organizar documentos",
      description: "Digitalizar e arquivar documentos antigos",
      status: TaskStatus.COMPLETED,
      priority: Priority.LOW,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      actualHours: 3,
      tags: ["organização"],
      categoryId: savedCategories[1].id,
      completedAt: new Date(),
    },
  ]

  for (const taskData of tasks) {
    const task = taskRepository.create({
      ...taskData,
      userId: demoUser.id,
    })
    await taskRepository.save(task)
  }
  console.log("✅ Tasks created")

  console.log("\n🎉 Seed completed successfully!")
  console.log("\nTest credentials:")
  console.log("Admin: admin@taskapp.com / admin123")
  console.log("User:  demo@taskapp.com / user123")

  await AppDataSource.destroy()
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error)
  process.exit(1)
})
