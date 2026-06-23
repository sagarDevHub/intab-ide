import {
  readTemplateStructureFromJson,
  saveTemplateStructureToJson,
} from '@/features/playground/lib/path-to-json';
import { db } from '@/lib/db';
import { templatePaths } from '@/lib/template';
import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs';

function validateJsonStructure(data: unknown): boolean {
  try {
    JSON.parse(JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Invalid JSON structure', error);
    return false;
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return Response.json({ error: `Missing playground Id` }, { status: 400 });
  }

  const playground = await db.playground.findUnique({
    where: { id },
  });

  if (!playground) {
    return Response.json({ error: 'Playground not found' }, { status: 404 });
  }

  const templateKey = playground.template as keyof typeof templatePaths;
  const templatePath = templatePaths[templateKey];

  if (!templatePath) {
    return Response.json({ error: 'Invalid template mapping context' }, { status: 404 });
  }

  const inputPath = path.join(process.cwd(), templatePath);
  const outputFile = path.join(process.cwd(), `output/${templateKey}.json`);

  if (!fs.existsSync(inputPath)) {
    console.warn(
      `⚠️ Warning: Starter boilerplate directory not found at ${inputPath}. Returning clean fallback template layout.`
    );
    return Response.json({
      success: true,
      templateJson: {
        folderName: 'Root',
        items: [
          {
            filename: 'index',
            fileExtension: 'ts',
            content: `// Automated workspace setup node\nconsole.log("Welcome to your isolated ${templateKey} sandbox!");`,
          },
        ],
      },
    });
  }

  try {
    await saveTemplateStructureToJson(inputPath, outputFile);
    const result = await readTemplateStructureFromJson(outputFile);

    if (!validateJsonStructure(result.items)) {
      return Response.json({ error: 'Invalid JSON structure structure parsed' }, { status: 500 });
    }

    await fs.promises.unlink(outputFile);

    return Response.json(
      {
        success: true,
        templateJson: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating schema track structure:', error);

    if (fs.existsSync(outputFile)) {
      try {
        fs.unlinkSync(outputFile);
      } catch {}
    }

    return Response.json(
      { error: 'Failed to safely crawl filesystem template structures' },
      { status: 500 }
    );
  }
}
