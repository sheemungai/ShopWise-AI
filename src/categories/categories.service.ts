import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  private async resolveParent(parent_id?: number): Promise<Category | null> {
    if (!parent_id) {
      return null;
    }
    const parent = await this.categoryRepository.findOne({
      where: { category_id: parent_id },
    });
    if (!parent) {
      throw new NotFoundException(
        `Parent category with id ${parent_id} not found`,
      );
    }
    return parent;
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const { parent_id, ...rest } = createCategoryDto;
    const parent = await this.resolveParent(parent_id);

    const category = this.categoryRepository.create({
      ...rest,
      parent,
    });
    return this.categoryRepository.save(category);
  }

  async findAll() {
    return this.categoryRepository.find({
      relations: { parent: true, children: true },
    });
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { category_id: id },
      relations: { parent: true, children: true },
    });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { category_id: id },
    });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    const { parent_id, ...rest } = updateCategoryDto;

    if (parent_id !== undefined) {
      if (parent_id === id) {
        throw new ConflictException('A category cannot be its own parent');
      }
      category.parent = await this.resolveParent(parent_id);
    }

    Object.assign(category, rest);
    return this.categoryRepository.save(category);
  }

  async remove(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { category_id: id },
      relations: { children: true },
    });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    if (category.children.length > 0) {
      throw new ConflictException(
        'Cannot delete a category that still has sub-categories. Remove or reassign them first.',
      );
    }

    return this.categoryRepository.delete(id);
  }
}
