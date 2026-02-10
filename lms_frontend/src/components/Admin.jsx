import { useState } from "react";
import { createCourse } from "../services/courseService";
import { createTeacher } from "../services/teacherService";
import { createStudent } from "../services/studentService";
import { createEnrollment } from "../services/enrollmentService";

function Admin() {
  const [activeTab, setActiveTab] = useState("teacher");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState({});

  const showMessage = (key, message, type = "success") => {
    setMessages((prev) => ({ ...prev, [key]: { message, type } }));
    setTimeout(() => {
      setMessages((prev) => {
        const newMsg = { ...prev };
        delete newMsg[key];
        return newMsg;
      });
    }, 3000);
  };

  async function handleCourseCreate(event) {
    event.preventDefault();
    setLoading(true);

    const values = {
      title: event.target.title.value.trim(),
      description: event.target.description.value.trim(),
      teacher: event.target.teacher.value.trim(),
    };

    if (!values.title || !values.description || !values.teacher) {
      showMessage("course", "Please fill in all fields", "error");
      setLoading(false);
      return;
    }

    try {
      await createCourse(values);
      showMessage("course", "Course created successfully!");
      event.target.reset();
    } catch (err) {
      showMessage(
        "course",
        "Failed to create course: " +
          (err.response?.data?.detail || err.message),
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleTeacherCreate(event) {
    event.preventDefault();
    setLoading(true);

    const values = {
      name: event.target.name.value.trim(),
      subject: event.target.subject.value.trim(),
    };

    if (!values.name || !values.subject) {
      showMessage("teacher", "Please fill in all fields", "error");
      setLoading(false);
      return;
    }

    try {
      await createTeacher(values);
      showMessage("teacher", "Teacher created successfully!");
      event.target.reset();
    } catch (err) {
      showMessage(
        "teacher",
        "Failed to create teacher: " +
          (err.response?.data?.detail || err.message),
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleStudentCreate(event) {
    event.preventDefault();
    setLoading(true);

    const values = {
      name: event.target.name.value.trim(),
      enrollment_date: event.target.enrollment_date.value,
    };

    if (!values.name || !values.enrollment_date) {
      showMessage("student", "Please fill in all fields", "error");
      setLoading(false);
      return;
    }

    try {
      await createStudent(values);
      showMessage("student", "Student created successfully!");
      event.target.reset();
    } catch (err) {
      showMessage(
        "student",
        "Failed to create student: " +
          (err.response?.data?.detail || err.message),
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleEnrollmentCreate(event) {
    event.preventDefault();
    setLoading(true);

    const values = {
      student: event.target.student.value.trim(),
      course: event.target.course.value.trim(),
    };

    if (!values.student || !values.course) {
      showMessage("enrollment", "Please fill in all fields", "error");
      setLoading(false);
      return;
    }

    try {
      await createEnrollment(values);
      showMessage("enrollment", "Enrollment created successfully!");
      event.target.reset();
    } catch (err) {
      showMessage(
        "enrollment",
        "Failed to create enrollment: " +
          (err.response?.data?.detail || err.message),
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  const renderMessage = (key) => {
    const msg = messages[key];
    if (!msg) return null;
    return (
      <div
        className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
          msg.type === "success"
            ? "bg-green-50 border-l-4 border-green-500"
            : "bg-red-50 border-l-4 border-red-500"
        }`}
      >
        <span
          className={`text-2xl shrink-0 ${msg.type === "success" ? "text-green-600" : "text-red-600"}`}
        >
          {msg.type === "success" ? "✓" : "⚠️"}
        </span>
        <p
          className={`font-semibold ${msg.type === "success" ? "text-green-700" : "text-red-700"}`}
        >
          {msg.message}
        </p>
      </div>
    );
  };

  const TabButton = ({ name, label }) => (
    <button
      onClick={() => setActiveTab(name)}
      className={`px-6 py-3 font-semibold rounded-lg transition duration-200 ${
        activeTab === name
          ? "bg-blue-600 text-white shadow-lg"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
    >
      {label}
    </button>
  );

  const FormSection = ({ title, onSubmit, fields, submitLabel }) => (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">{title}</h2>
      {renderMessage(title.toLowerCase().split(" ")[0])}
      <form onSubmit={onSubmit} className="space-y-5">
        {fields.map((field, idx) => (
          <div key={idx}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.label}
            </label>
            <input
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200 bg-gray-50 hover:bg-white"
              disabled={loading}
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : submitLabel}
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Manage teachers, courses, students, and enrollments
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4 mb-12">
          <TabButton name="teacher" label="👨‍🏫 Teachers" />
          <TabButton name="course" label="📚 Courses" />
          <TabButton name="student" label="👨‍🎓 Students" />
          <TabButton name="enrollment" label="📝 Enrollments" />
        </div>

        {/* Teacher Management */}
        {activeTab === "teacher" && (
          <FormSection
            title="Teacher Management"
            onSubmit={handleTeacherCreate}
            fields={[
              {
                name: "name",
                type: "text",
                label: "Teacher Name",
                placeholder: "Enter teacher name",
              },
              {
                name: "subject",
                type: "text",
                label: "Subject",
                placeholder: "Enter subject (e.g., Mathematics, Physics)",
              },
            ]}
            submitLabel="Add Teacher"
          />
        )}

        {/* Course Management */}
        {activeTab === "course" && (
          <FormSection
            title="Course Management"
            onSubmit={handleCourseCreate}
            fields={[
              {
                name: "title",
                type: "text",
                label: "Course Title",
                placeholder: "Enter course title",
              },
              {
                name: "description",
                type: "text",
                label: "Description",
                placeholder: "Enter course description",
              },
              {
                name: "teacher",
                type: "text",
                label: "Teacher ID",
                placeholder: "Enter teacher ID",
              },
            ]}
            submitLabel="Add Course"
          />
        )}

        {/* Student Management */}
        {activeTab === "student" && (
          <FormSection
            title="Student Management"
            onSubmit={handleStudentCreate}
            fields={[
              {
                name: "name",
                type: "text",
                label: "Student Name",
                placeholder: "Enter student name",
              },
              {
                name: "enrollment_date",
                type: "date",
                label: "Enrollment Date",
                placeholder: "Select enrollment date",
              },
            ]}
            submitLabel="Add Student"
          />
        )}

        {/* Enrollment Management */}
        {activeTab === "enrollment" && (
          <FormSection
            title="Enrollment Management"
            onSubmit={handleEnrollmentCreate}
            fields={[
              {
                name: "student",
                type: "text",
                label: "Student ID",
                placeholder: "Enter student ID",
              },
              {
                name: "course",
                type: "text",
                label: "Course ID",
                placeholder: "Enter course ID",
              },
            ]}
            submitLabel="Add Enrollment"
          />
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-4 gap-6 mt-12">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition duration-200">
            <div className="text-4xl mb-3">👨‍🏫</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Teachers</h3>
            <p className="text-gray-600">Manage instructor accounts</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition duration-200">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Courses</h3>
            <p className="text-gray-600">Manage course content</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition duration-200">
            <div className="text-4xl mb-3">👨‍🎓</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Students</h3>
            <p className="text-gray-600">Manage student accounts</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition duration-200">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Enrollments
            </h3>
            <p className="text-gray-600">Manage enrollments</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
