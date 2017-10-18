// Based on work by Meishu https://github.com/meishuu

const Command = require('command')

module.exports = function Dueler(dispatch) {

	let enabled = false,
		name = '',
		duelist1 = 'Yugi.Muto', // <- Configure me
		duelist2 = 'Seto.Kaiba', // <- Configure me
		partner = '',
		partnerid = null,
		start = true
	
	dispatch.hook('S_LOGIN', 4, event => {
		name = event.name
		if(name == duelist1) partner = duelist2.toLowerCase()
		else if(name == duelist2) partner = duelist1.toLowerCase()
		enabled = false
	})
	
	dispatch.hook('S_REQUEST_CONTRACT', 1, (event) => { 
		if(enabled) {
			if(event.senderName.toLowerCase() == partner) {
				start = true
				partnerid = event.senderId
				dispatch.toServer('C_ACCEPT_CONTRACT', 1, { 
					type: event.type,
					id: event.id
				})
				return false
			}
			if(event.recipientName.toLowerCase() == partner) {
				start = false
				partnerid = event.recipientId
				return false
			}
		}
	})

	dispatch.hook('S_CHANGE_RELATION', 1, (event) => { 
		if(enabled && partnerid.equals(event.target)) {
			if(event.relation == 5 && !start) {
				dispatch.toServer('C_DUEL_CANCEL', 1)
				dispatch.toServer('C_LEAVE_GROUP_DUEL', 1)
			}
		}
	})

	dispatch.hook('S_DUEL_END', 1, (event) => {
		if(enabled && start) {
			dispatch.toServer('C_REQUEST_CONTRACT', 1, { 
				type: 11,
				unk2: 0,
				unk3: 0,
				unk4: 0,
				name: partner
			})
		}
	})
	
	const command = Command(dispatch)
	command.add('duel', (param) => {
		if(param == null) {
			enabled = !enabled
			if(enabled) {
				if(name == duelist1) command.message('[Dueler] It\'s time to d-d-d-d-d-d-d-duel ' + duelist2 + '!')
				else if(name == duelist2) command.message('[Dueler] It\'s time to d-d-d-d-d-d-d-duel ' + duelist1 + '!')
				dispatch.toServer('C_REQUEST_CONTRACT', 1, { 
					type: 11,
					unk2: 0,
					unk3: 0,
					unk4: 0,
					name: partner
				})
			}
			else command.message('[Dueler] Stopping duels with ' + partner)
		}
		else {
			partner = param
			command.message('[Dueler] Dueling partner is now ' + partner)
		}
	})
}
