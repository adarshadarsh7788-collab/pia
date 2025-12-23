import { models } from '../models/index.js';
import { Op } from 'sequelize';

class ESGController {
  static async create(modelName, data) {
    try {
      const model = models[modelName];
      if (!model) throw new Error(`Model ${modelName} not found`);
      
      const result = await model.create(data);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async findAll(modelName, companyId, filters = {}) {
    try {
      const model = models[modelName];
      if (!model) throw new Error(`Model ${modelName} not found`);
      
      const where = { companyId, ...filters };
      const result = await model.findAll({ where, order: [['createdAt', 'DESC']] });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async update(modelName, id, data) {
    try {
      const model = models[modelName];
      if (!model) throw new Error(`Model ${modelName} not found`);
      
      const [updatedRows] = await model.update(data, { where: { id } });
      if (updatedRows === 0) throw new Error('Record not found');
      
      const result = await model.findByPk(id);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async delete(modelName, id) {
    try {
      const model = models[modelName];
      if (!model) throw new Error(`Model ${modelName} not found`);
      
      const deletedRows = await model.destroy({ where: { id } });
      if (deletedRows === 0) throw new Error('Record not found');
      
      return { success: true, message: 'Record deleted successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default ESGController;