import React from 'react';
import { View, Text } from 'react-native';
import MemberInput from './MemberInput';
import { styles } from '../styles';

const MemberDetails = ({
    members,
    memberDocuments,
    memberErrors,
    relationOptions,
    onMemberUpdate,
    onPickAadhaarDocument,
    onRemoveAadhaarDocument,
    onViewDocument,
}) => {
    if (!members || members.length === 0) {
        return null;
    }

    return (
        <View style={styles.membersSection}>
            <Text style={styles.sectionTitle}>Member Details</Text>
            {members.map((member, index) => {
                const typeIndex = members.filter(m => m.type === member.type).indexOf(member) + 1;
                const { ADULT_RELATIONS, PARENT_RELATIONS, CHILD_RELATIONS } = relationOptions;

                return (
                    <MemberInput
                        key={`member-${member.type}-${typeIndex}`}
                        index={index}
                        member={{ ...member, displayIndex: typeIndex }}
                        onUpdate={onMemberUpdate}
                        relationOptions={
                            member.type === 'Adult'
                                ? ADULT_RELATIONS
                                : member.type === 'Parent'
                                    ? PARENT_RELATIONS
                                    : CHILD_RELATIONS
                        }
                        aadhaarDocument={memberDocuments[`member_${index}_aadhaar`]}
                        onPickAadhaarDocument={onPickAadhaarDocument}
                        onRemoveAadhaarDocument={onRemoveAadhaarDocument}
                        onViewAadhaarDocument={onViewDocument}
                        errors={memberErrors[index] || {}}
                    />
                );
            })}
        </View>
    );
};

export default MemberDetails;
