import { DataTypes, Sequelize } from "sequelize";
import { Connection } from "../db/connection";

import UsersModel from './users.model';

const TransactionsModel = () => {
	let model = (Connection.getInstance().db as Sequelize).define('transactions', {
		"id": {
			"type": DataTypes.UUID,
			"primaryKey": true,
			"defaultValue": DataTypes.UUIDV4,
		},
		"user_id": {
			"type": DataTypes.STRING
		},
		"type": {
			"type": DataTypes.STRING
		},
		"value": {
			"type": DataTypes.STRING
		},
		"created_at": {
			"type": DataTypes.STRING
		},
		"updated_at": {
			"type": DataTypes.STRING
		}
	});

	model.hasMany(UsersModel(), {
		sourceKey: 'user_id',
		foreignKey: 'id',
		as: 'transaction_users'
	});
	UsersModel().belongsTo(model);

	return model;
}

export default TransactionsModel;