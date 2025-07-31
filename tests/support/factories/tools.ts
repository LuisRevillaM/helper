import { faker } from "@faker-js/faker";
import { takeUniqueOrThrow } from "@/components/utils/arrays";
import { db } from "@/db/client";
import { tools } from "@/db/schema";

type Tool = typeof tools.$inferInsert;

export const toolsFactory = {
  create: async (overrides: Partial<Tool>) => {
    const token = faker.string.alphanumeric(32);
    const defaultTool: Tool = {
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      slug: faker.helpers.slugify(faker.company.name().toLowerCase()),
      url: faker.internet.url(),
      requestMethod: "POST",
      headers: null,
      parameters: null,
      authenticationMethod: "bearer_token",
      authenticationToken: token,
      authenticationTokenPlaintext: token,
      enabled: true,
      availableInChat: false,
      availableInAnonymousChat: false,
      customerEmailParameter: null,
    };

    const toolData = { ...defaultTool, ...overrides };
    if (toolData.authenticationToken && !toolData.authenticationTokenPlaintext) {
      toolData.authenticationTokenPlaintext = toolData.authenticationToken;
    }

    const tool = await db.insert(tools).values(toolData).returning().then(takeUniqueOrThrow);

    return { tool };
  },
};
