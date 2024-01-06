import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Image,
  useWindowDimensions
} from 'react-native';

import Checkbox from 'expo-checkbox';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import YourImage from '../images/output_1576163316_0.jpg';







const WeeklyTasks = () => {

  const { height, width } = useWindowDimensions(); // Use useWindowDimensions inside the component

  const [newTask, setNewTask] = useState('');
  const [count, setCount] = useState(4);
  const [data, setData] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });  const [editedItems, setEditedItems] = useState({});
  const [filter, setFilter] = useState('All');
  const [filteredData, setFilteredData] = useState(data['Monday']);
  const [filterText, setFilterText] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday'); // New state variable
  const [selectedData, setSelectedData] = useState(data['Monday']); // Initialize with tasks for Monday


   // Load data from local storage when the component mounts
   useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('TASK_DATA');
        if (storedData) {
          setData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Error loading data from AsyncStorage:', error);
      }
    };

    loadData();
  }, []);

  // Save data to local storage whenever it changes
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('TASK_DATA', JSON.stringify(data));
      } catch (error) {
        console.error('Error saving data to AsyncStorage:', error);
      }
    };

    saveData();
  }, [data]);
  
  const handleDeleteTask = (key) => {
    const updatedData = { ...data, [selectedDay]: data[selectedDay].filter(item => item.key !== key) };
    setData(updatedData);
  
    // Update selectedData based on the selected day
    setSelectedData(filterData(updatedData[selectedDay], filter));
  };

  const updateSelectedDay = (day) => {
    setSelectedDay(day);
    setSelectedData(filterData(data[day], filter));
  };

  const updateTaskName = (day, key, newName) => {
    const index = data[day].findIndex((item) => item.key === key);
    const newData = { ...data };
    newData[day][index] = { ...newData[day][index], description: newName };
    setData(newData);
    setEditedItems({ ...editedItems, [key]: false });
  };

  const updateTaskStatus = (day, key, completed) => {
    const index = data[day].findIndex((item) => item.key === key);
    const newData = { ...data };
    newData[day][index] = { ...newData[day][index], completed };
    setData(newData);
    const filtered = filterData(newData[day], filter);
    setFilteredData(filtered);
  };
console.log("Hello!")
  useEffect(() => {
    const filtered = filterData(data['Monday'], filter);
    setFilteredData(filtered);
  }, [data, filter]);

  const filterData = (dayData, filter) => {
    switch (filter) {
      case 'Completed':
        return dayData.filter((item) => item.completed);
      case 'Not Completed':
        return dayData.filter((item) => !item.completed);
      default:
        return dayData;
    }
  };

  const renderDayButtons = () => {
    return Object.keys(data).map((day) => (
      <TouchableOpacity
        key={day}
        onPress={() => updateSelectedDay(day)}
        style={[style.dayButton, selectedDay === day && style.selectedDayButton]} // Apply selected day style conditionally
      >
        <Text style={[style.dayButtonText, selectedDay === day && style.selectedDayText]}>{day}</Text>
      </TouchableOpacity>
    ));
  };
 
  const Item = ({ item, onToggleCompleted, onEdit, updateTaskName, onDelete, isEditing }) => {
    const [isChecked, setChecked] = useState(item.completed);
  
    const handleToggleCompleted = () => {
      setChecked(!isChecked);
      onToggleCompleted(item.key, !isChecked);
    };
  
    const handleEdit = () => {
      onEdit(item.key, true);
    };
  
    const handleSave = (key, newName) => {
      onEdit(key, false);
      updateTaskName(key, newName);
    };
  
    const handleDelete = () => {
      onDelete(item.key);
    };
  
    return (
      <View style={style.item}>
        {isEditing ? (
          <EditItem item={item} onSave={handleSave} onEdit={onEdit} />
        ) : (
          <>
            <Checkbox
              value={isChecked || false}
              onValueChange={handleToggleCompleted}
              style={style.checkbox}
            />
            <Text
              style={isChecked ? style.completed : style.notCompleted}
            >
              {item.description}
            </Text>
            <TouchableOpacity onPress={handleEdit}>
              <FontAwesomeIcon
                style={style.edit}
                size={15}
                icon={faPen}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <Text style={style.deleteButton}>🗑️</Text>
            </TouchableOpacity>
          </>
        )}
  
        <StatusBar style="auto" />
      </View>
    );
  };

  const EditItem = ({ item, onSave, onEdit }) => {
    const [editedName, setEditedName] = useState(item.description);

    const handleSave = (key, newName) => {
      onEdit(key, false);
      onSave(key, newName);
    };

    return (
      <View style={style.editItem}>
        <TextInput
          style={style.editInput}
          value={editedName}
          onChangeText={setEditedName}
        />
        <TouchableOpacity onPress={() => handleSave(item.key, editedName)}>
          <Text style={style.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleAddTask = () => {
    if (newTask !== '') {
      const newKey = `${count}`;
      const updatedData = { ...data, [selectedDay]: [...data[selectedDay], { key: newKey, description: newTask }] };
      setData(updatedData);

      // Update selectedData based on the selected day
      setSelectedData(filterData(updatedData[selectedDay], filter));

      setNewTask('');
      setCount(count + 1);
    }
  };
  useEffect(() => {
    console.log('selectedData changed:', selectedData);
  }, [selectedData]);
  
  useEffect(() => {
    console.log('filteredData changed:', filteredData);
  }, [filteredData]);
  return (
    <SafeAreaView style={[style.container, { height, width }]}>
      <View style={style.dayButtonsContainer}>{renderDayButtons()}</View>
      <Image source={YourImage} style={style.image} />
      <TextInput
        placeholder={'Add new task here...'}
        style={style.input}
        value={newTask}
        onChangeText={setNewTask}
        returnKeyType="go"
        onSubmitEditing={handleAddTask}
      />
      <TouchableOpacity onPress={handleAddTask} style={style.addTask}>
        <Text style={{ color: 'white', fontSize: 20 }}>Add Task</Text>
      </TouchableOpacity>
      <FlatList
  data={selectedData}
  extraData={filteredData}
  renderItem={({ item }) => (
    <Item
      item={item}
      onToggleCompleted={(key, completed) => updateTaskStatus(selectedDay, key, completed)}
      onEdit={(key, value) => setEditedItems({ ...editedItems, [key]: value })}
      updateTaskName={(key, newName) => updateTaskName(selectedDay, key, newName)}
      onDelete={handleDeleteTask} 
      isEditing={editedItems[item.key]}
    />
  )}
  keyExtractor={(item) => item.key}
/>
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  
  container: {
    flex: 1,
    backgroundColor: '#EEF0F41',
    alignItems: 'center',
  },
  image: {
    marginBottom: 20,
    borderRadius: 10,
    width: 150, // Specify the width as needed
    height: 150, // Specify the height as needed
  },
  addTask: {
    marginTop: 10,
    backgroundColor: "#AC485A",
    border: 0,
    padding: 15,
    borderRadius: 8,
    textAlign: "center",
    fontFamily: 'Rubik',
    width: 280
  },
  dayButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  selectedDayButton: {
    backgroundColor: '#AC485A', // Customize the background color for the selected day
  },
  selectedDayText: {
    color: 'white',
  },
  dayButton: {
    padding: 5,
    backgroundColor: '#B4C5E4',
    borderRadius: 5,
    marginHorizontal: 5,
    fontFamily: 'Rubik',
    borderColor: 'black',
  },
  dayButtonText: {
    fontSize: 16,
  },
  shadowProp: {
    shadowColor: '#171717',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5, // for Android
  },
  list: {
    fontSize: 18,
    color: 'white',
  },
  item: {
    flexDirection: 'row', // Set the direction to row
    alignItems: 'center', // Align items vertically in the center
    justifyContent: 'space-between', // Distribute items with space between
    margin: 10,
    backgroundColor: '#FFFDF8',
    padding: 10,
    borderRadius: 8,
    fontFamily: 'Rubik',
  },
  checkbox: {
    marginRight: 10, // Add right margin to separate checkbox from text
  },
  description: {
    flex: 1, // Allow the text to take up the available space
    fontSize: 20,
  },
  deleteButton: {
    marginLeft: 10,
    fontSize: 20,
  },
  deleteButtonText: {
    color: 'white', // Customize delete button text color
  },
  completed: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  notCompleted: {
    textDecorationLine: 'none',
    textDecorationStyle: 'solid',
  },
  input: {
    color: '#432000',
    backgroundColor: '#DCE1EB',
    border: 0,
    padding: 15,
    borderRadius: 8,
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'Rubik',
  },
  edit: {
    padding: 10,
  },
  filter: {
    margin: 10,
  },
  textFilter: {
    borderWidth: 2,
    borderRadius: 5,
    backgroundColor: '#B4C5E4',
  },
  filterOptions: {
    flexDirection: 'row',
  },
  activeFilter: {
    textDecorationLine: 'underline',
    textDecorationColor: '#3066be',
    textDecorationWidth: 10,
  },
});
export default WeeklyTasks